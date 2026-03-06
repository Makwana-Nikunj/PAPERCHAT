import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sql } from "../db/index.js";
import { getIO } from "../sockets/chat.sockets.js";

const sendRequest = asyncHandler(async (req, res) => {
    const { receiverId } = req.body || {};
    const senderId = req.user?.id;

    // Validate required fields
    if (!receiverId) {
        throw new ApiError(400, "Receiver ID is required");
    }
    if (receiverId === senderId) {
        throw new ApiError(400, "You cannot send a request to yourself");
    }
    // Check if receiver exists
    const receiver = await sql`SELECT id FROM users WHERE id = ${receiverId}`;

    if (receiver.length === 0) {
        throw new ApiError(404, "Receiver not found");
    }
    // Check if request already exists
    const existingRequest = await sql`
        SELECT id FROM chat_requests 
        WHERE (sender_id = ${senderId} AND receiver_id = ${receiverId}) 
           OR (sender_id = ${receiverId} AND receiver_id = ${senderId})
    `;
    if (existingRequest.length > 0) {
        throw new ApiError(409, "Request already exists");
    }

    const request = await sql`
        INSERT INTO chat_requests (sender_id, receiver_id)
        VALUES (${senderId}, ${receiverId})
        RETURNING *
    `;

    // Notify receiver via socket so their requests list updates in real-time
    const io = getIO();
    if (io && request.length > 0) {
        const senderInfo = await sql`
            SELECT username, avatar FROM users WHERE id = ${senderId}
        `;
        if (senderInfo.length > 0) {
            io.to(String(receiverId)).emit("new_request", {
                id: request[0].id,
                sender_id: senderId,
                receiver_id: receiverId,
                status: "pending",
                created_at: request[0].created_at,
                sender_username: senderInfo[0].username,
                sender_avatar: senderInfo[0].avatar
            });
        }
    }

    return res.status(201).json(new ApiResponse(201, request[0], "Request sent successfully"));
});

const getRequests = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    const requests = await sql`
        SELECT cr.id, cr.sender_id, cr.receiver_id, cr.status, cr.created_at,
               u.username AS sender_username , u.avatar AS sender_avatar
        FROM chat_requests cr
        JOIN users u ON cr.sender_id = u.id
        WHERE cr.receiver_id = ${userId} AND cr.status = 'pending'
        ORDER BY cr.created_at DESC
    `;

    return res.status(200).json(new ApiResponse(200, requests, "Requests retrieved successfully"));
});

const acceptRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params || {};
    const userId = req.user?.id;

    // Validate requestId
    if (!requestId) {
        throw new ApiError(400, "Request ID is required");
    }
    // Check if request exists and belongs to the user
    const request = await sql`
        SELECT * FROM chat_requests 
        WHERE id = ${requestId} AND receiver_id = ${userId} AND status = 'pending'
    `;

    if (request.length === 0) {
        throw new ApiError(404, "Request not found or not authorized");
    }

    const senderId = request[0].sender_id;
    const receiverId = request[0].receiver_id;

    // Create chat between sender and receiver
    const newChat = await sql`
        INSERT INTO chats (user1_id, user2_id)
        VALUES (${senderId}, ${receiverId})
        RETURNING id, user1_id, user2_id, created_at
    `;

    // Delete request
    await sql`
        DELETE FROM chat_requests 
        WHERE id = ${requestId}
    `;

    // Notify sender via socket so their chat list updates in real-time
    const io = getIO();
    if (io && newChat.length > 0) {
        const chatId = newChat[0].id;

        // Get partner info for the sender (the receiver/acceptor's info)
        const receiverInfo = await sql`
            SELECT id, username, avatar FROM users WHERE id = ${receiverId}
        `;

        // Get partner info for the receiver (the sender's info)
        const senderInfo = await sql`
            SELECT id, username, avatar FROM users WHERE id = ${senderId}
        `;

        // Emit to sender — they see the acceptor as their partner
        if (receiverInfo.length > 0) {
            io.to(String(senderId)).emit("new_chat", {
                id: chatId,
                user1_id: senderId,
                user2_id: receiverId,
                partner_name: receiverInfo[0].username,
                partner_avatar: receiverInfo[0].avatar,
                partner_id: receiverInfo[0].id,
                last_message: null,
                last_message_time: null,
                created_at: newChat[0].created_at
            });
        }

        // Also emit to receiver (the acceptor) so they get the full chat object
        if (senderInfo.length > 0) {
            io.to(String(receiverId)).emit("new_chat", {
                id: chatId,
                user1_id: senderId,
                user2_id: receiverId,
                partner_name: senderInfo[0].username,
                partner_avatar: senderInfo[0].avatar,
                partner_id: senderInfo[0].id,
                last_message: null,
                last_message_time: null,
                created_at: newChat[0].created_at
            });
        }

        // Make both users join the chat room
        const senderSockets = await io.in(String(senderId)).fetchSockets();
        senderSockets.forEach(s => s.join(String(chatId)));

        const receiverSockets = await io.in(String(receiverId)).fetchSockets();
        receiverSockets.forEach(s => s.join(String(chatId)));
    }

    return res.status(200).json(new ApiResponse(200, {}, "Request accepted successfully"));
});

const rejectRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params || {};
    const userId = req.user?.id;

    // Validate requestId
    if (!requestId) {
        throw new ApiError(400, "Request ID is required");
    }
    // Check if request exists and belongs to the user
    const request = await sql`
        SELECT * FROM chat_requests 
        WHERE id = ${requestId} AND receiver_id = ${userId} AND status = 'pending'
    `;
    if (request.length === 0) {
        throw new ApiError(404, "Request not found or not authorized");
    }

    // Update request status to rejected
    await sql`
        DELETE FROM chat_requests 
        WHERE id = ${requestId} AND status = 'pending'
    `;

    return res.status(200).json(new ApiResponse(200, {}, "Request rejected successfully"));
});



export { sendRequest, getRequests, acceptRequest, rejectRequest };
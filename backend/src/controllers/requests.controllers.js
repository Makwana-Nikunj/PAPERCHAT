import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sql } from "../db/index.js";

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
    // Create chat between sender and receiver if request is accepted
    await sql`
        INSERT INTO chats (user1_id, user2_id)
        VALUES (${request[0].sender_id}, ${request[0].receiver_id})
    `;
    // Delete request status if user accepted it
    await sql`
        DELETE FROM chat_requests 
        WHERE id = ${requestId}
    `;
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
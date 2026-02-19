import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sql } from "../db/index.js";


const getUserChats = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    const chats = await sql`
        SELECT
            c.id,
            c.user1_id,
            c.user2_id,
            c.created_at,
            CASE WHEN c.user1_id = ${userId} THEN u2.username ELSE u1.username END AS partner_name,
            CASE WHEN c.user1_id = ${userId} THEN u2.avatar ELSE u1.avatar END AS partner_avatar,
            CASE WHEN c.user1_id = ${userId} THEN u2.id ELSE u1.id END AS partner_id,
            (
                SELECT content FROM messages
                WHERE chat_id = c.id
                ORDER BY created_at DESC LIMIT 1
            ) AS last_message,
            (
                SELECT created_at FROM messages
                WHERE chat_id = c.id
                ORDER BY created_at DESC LIMIT 1
            ) AS last_message_time
        FROM chats c
        JOIN users u1 ON c.user1_id = u1.id
        JOIN users u2 ON c.user2_id = u2.id
        WHERE c.user1_id = ${userId} OR c.user2_id = ${userId}
        ORDER BY last_message_time DESC NULLS LAST
    `;

    return res.status(200).json(new ApiResponse(200, chats, "Chats retrieved successfully"));
});

const deleteChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params || {};
    const userId = req.user?.id;

    // Validate chatId
    if (!chatId) {
        throw new ApiError(400, "Chat ID is required");
    }
    // Check if chat exists and user is a participant
    const chat = await sql`
        SELECT id, user1_id, user2_id FROM chats WHERE id = ${chatId}
    `;
    if (chat.length === 0) {
        throw new ApiError(404, "Chat not found");
    }
    const isParticipant = chat[0].user1_id === userId || chat[0].user2_id === userId;

    if (!isParticipant) {
        throw new ApiError(403, "You are not authorized to delete this chat");
    }
    // Delete chat
    await sql`
        DELETE FROM chats WHERE id = ${chatId}
    `;
    return res.status(200).json(new ApiResponse(200, {}, "Chat deleted successfully"));
});



export { getUserChats, deleteChat };

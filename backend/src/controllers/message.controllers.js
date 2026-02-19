import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sql } from "../db/index.js";


// ============================================
// REST controller — fetch chat history
// ============================================
const getMessagesByChatId = asyncHandler(async (req, res) => {
    const { chatId } = req.params || {};
    const userId = req.user?.id;

    if (!chatId) {
        throw new ApiError(400, "Chat ID is required");
    }

    const chat = await sql`
        SELECT id, user1_id, user2_id FROM chats WHERE id = ${chatId}
    `;

    if (chat.length === 0) {
        throw new ApiError(404, "Chat not found");
    }

    const isParticipant = chat[0].user1_id === userId || chat[0].user2_id === userId;
    if (!isParticipant) {
        throw new ApiError(403, "You are not authorized to access this chat");
    }

    const messages = await sql`
        SELECT m.id, m.content, m.sender_id, m.chat_id, m.is_read, m.created_at,
               u.username AS sender_username
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.chat_id = ${chatId}
        ORDER BY m.created_at ASC
    `;

    return res.status(200).json(new ApiResponse(200, messages, "Messages retrieved successfully"));
});


// ============================================
// Socket service functions — called from chat.sockets.js
// ============================================

const getUserChats = async (userId) => {
    return await sql`
        SELECT id FROM chats
        WHERE user1_id = ${userId} OR user2_id = ${userId};
    `;
};

const createMessage = async (userId, chatId, content) => {
    // Verify user is a participant
    const chat = await sql`
        SELECT id FROM chats
        WHERE id = ${chatId}
          AND (user1_id = ${userId} OR user2_id = ${userId});
    `;
    if (chat.length === 0) return null;

    const [message] = await sql`
        INSERT INTO messages (chat_id, sender_id, content)
        VALUES (${chatId}, ${userId}, ${content})
        RETURNING *;
    `;
    return message;
};

const editMessage = async (userId, messageId, content) => {
    // Verify ownership
    const existing = await sql`
        SELECT id, sender_id, chat_id FROM messages
        WHERE id = ${messageId} AND sender_id = ${userId};
    `;
    if (existing.length === 0) return null;

    const [updated] = await sql`
        UPDATE messages SET content = ${content}
        WHERE id = ${messageId}
        RETURNING *;
    `;
    return { message: updated, chatId: existing[0].chat_id };
};

const deleteMessage = async (userId, messageId) => {
    // Verify ownership
    const existing = await sql`
        SELECT id, sender_id, chat_id FROM messages
        WHERE id = ${messageId} AND sender_id = ${userId};
    `;
    if (existing.length === 0) return null;

    await sql`DELETE FROM messages WHERE id = ${messageId}`;
    return { messageId: existing[0].id, chatId: existing[0].chat_id };
};


export { getMessagesByChatId, getUserChats, createMessage, editMessage, deleteMessage };
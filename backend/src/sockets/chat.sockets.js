import jwt from "jsonwebtoken";
import { getUserChats, createMessage, editMessage, deleteMessage } from "../controllers/message.controllers.js";

const initChatSocket = (io) => {

    // JWT AUTH MIDDLEWARE — expects accessToken from frontend
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.accessToken;
            if (!token) return next(new Error("Authentication required"));

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            return next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", async (socket) => {
        try {
            const userId = socket.userId;

            // Join personal room + all chat rooms
            socket.join(String(userId));
            const chats = await getUserChats(userId);
            chats.forEach(chat => socket.join(String(chat.id)));

            // JOIN NEW CHAT
            socket.on("join_chat", (chatId) => {
                if (chatId) socket.join(String(chatId));
            });

            // SEND MESSAGE
            socket.on("send_message", async ({ chatId, content }) => {
                try {
                    if (!chatId || !content?.trim()) return;
                    const message = await createMessage(userId, chatId, content);
                    if (message) io.to(String(chatId)).emit("receive_message", message);
                } catch (err) {
                    console.error("Error sending message:", err);
                }
            });

            // EDIT MESSAGE
            socket.on("edit_message", async ({ messageId, content }) => {
                try {
                    if (!messageId || !content?.trim()) return;
                    const result = await editMessage(userId, messageId, content);
                    if (result) io.to(String(result.chatId)).emit("message_updated", result.message);
                } catch (err) {
                    console.error("Error editing message:", err);
                }
            });

            // DELETE MESSAGE
            socket.on("delete_message", async ({ messageId }) => {
                try {
                    if (!messageId) return;
                    const result = await deleteMessage(userId, messageId);
                    if (result) io.to(String(result.chatId)).emit("message_deleted", result);
                } catch (err) {
                    console.error("Error deleting message:", err);
                }
            });

            // DISCONNECT
            socket.on("disconnect", () => {
                console.log(`User ${userId} disconnected`);
            });

        } catch (error) {
            console.error("Socket error:", error);
        }
    });
};

export { initChatSocket };

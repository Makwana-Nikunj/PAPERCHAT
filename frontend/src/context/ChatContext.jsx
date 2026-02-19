import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { api, getAccessToken } from "../services/api";
import { connectSocket, disconnectSocket, getSocket } from "../services/socket";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
    const { isAuthenticated, user } = useAuth();
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const socketRef = useRef(null);

    // Connect socket when authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            disconnectSocket();
            socketRef.current = null;
            return;
        }

        const token = getAccessToken();
        if (!token) return;

        const sock = connectSocket(token);
        socketRef.current = sock;

        // Listen for real-time messages
        sock.on("receive_message", (message) => {
            setMessages((prev) => {
                // Only add if it's for the active chat and not a duplicate
                if (prev.some((m) => m.id === message.id)) return prev;
                return [...prev, message];
            });

            // Update chat list preview
            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === message.chat_id
                        ? { ...chat, last_message: message.content, last_message_time: message.created_at }
                        : chat
                )
            );
        });

        sock.on("message_updated", (updatedMsg) => {
            setMessages((prev) =>
                prev.map((m) => (m.id === updatedMsg.id ? { ...m, content: updatedMsg.content } : m))
            );
        });

        sock.on("message_deleted", ({ messageId }) => {
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
        });

        return () => {
            sock.off("receive_message");
            sock.off("message_updated");
            sock.off("message_deleted");
            disconnectSocket();
            socketRef.current = null;
        };
    }, [isAuthenticated]);

    // Load chats when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadChats();
            loadRequests();
        } else {
            setChats([]);
            setMessages([]);
            setRequests([]);
            setActiveChat(null);
        }
    }, [isAuthenticated]);

    const loadChats = useCallback(async () => {
        try {
            const res = await api.get("/chats");
            setChats(res.data || []);
        } catch (err) {
            console.error("Failed to load chats:", err);
        }
    }, []);

    const loadRequests = useCallback(async () => {
        try {
            const res = await api.get("/requests");
            setRequests(res.data || []);
        } catch (err) {
            console.error("Failed to load requests:", err);
        }
    }, []);

    const loadMessages = useCallback(async (chatId) => {
        setLoadingMessages(true);
        try {
            const res = await api.get(`/messages/${chatId}`);
            // Handle paginated response { messages, pagination }
            const data = res.data;
            setMessages(data?.messages ?? data ?? []);
        } catch (err) {
            console.error("Failed to load messages:", err);
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    const switchChat = useCallback(async (chat) => {
        setActiveChat(chat);
        if (chat?.id) {
            await loadMessages(chat.id);
            // Join the chat room via socket
            const sock = socketRef.current || getSocket();
            if (sock) {
                sock.emit("join_chat", chat.id);
            }
        }
    }, [loadMessages]);

    const sendMessage = useCallback((chatId, content) => {
        const sock = socketRef.current || getSocket();
        if (sock && content?.trim()) {
            sock.emit("send_message", { chatId, content: content.trim() });
        }
    }, []);

    const editMessage = useCallback((messageId, content) => {
        const sock = socketRef.current || getSocket();
        if (sock && content?.trim()) {
            sock.emit("edit_message", { messageId, content: content.trim() });
        }
    }, []);

    const deleteMessage = useCallback((messageId) => {
        const sock = socketRef.current || getSocket();
        if (sock) {
            sock.emit("delete_message", { messageId });
        }
    }, []);

    const sendRequest = useCallback(async (receiverId) => {
        const res = await api.post("/requests", { receiverId });
        return res.data;
    }, []);

    const acceptRequest = useCallback(async (requestId) => {
        await api.put(`/requests/${requestId}`);
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        // Reload chats after accepting
        loadChats();
    }, [loadChats]);

    const rejectRequest = useCallback(async (requestId) => {
        await api.delete(`/requests/${requestId}`);
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
    }, []);

    const addChat = useCallback((chat) => {
        setChats((prev) => {
            if (prev.some((c) => c.id === chat.id)) return prev;
            return [chat, ...prev];
        });
    }, []);

    const removeChat = useCallback(async (chatId) => {
        try {
            await api.delete(`/chats/${chatId}`);
            setChats((prev) => prev.filter((c) => c.id !== chatId));
            if (activeChat?.id === chatId) {
                setActiveChat(null);
                setMessages([]);
            }
        } catch (err) {
            console.error("Failed to delete chat:", err);
        }
    }, [activeChat]);

    return (
        <ChatContext.Provider
            value={{
                chats, setChats, activeChat, messages, requests, loadingMessages,
                switchChat, sendMessage, editMessage, deleteMessage,
                loadMessages, loadChats, loadRequests,
                sendRequest, acceptRequest, rejectRequest,
                addChat, removeChat,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChat must be used within ChatProvider");
    return ctx;
}

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useVideoCall } from "../context/useVideoCall";

export default function ChatPage() {
    const navigate = useNavigate();
    const { chatId } = useParams();
    const location = useLocation();
    const { user } = useAuth();
    const { messages, loadingMessages, sendMessage, editMessage, deleteMessage, loadMessages } = useChat();
    const { incomingCall, setIncomingCall, startCall, acceptCall, rejectCall, callStatus } = useVideoCall();

    const [input, setInput] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [contextMenu, setContextMenu] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const chat = location.state?.chat;
    const partnerName = chat?.partner_name || "Chat";
    const partnerAvatar = chat?.partner_avatar;

    const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

    useEffect(() => {
        if (chatId) loadMessages(parseInt(chatId));
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    // Enrich incoming call with partner info
    useEffect(() => {
        if (incomingCall && !incomingCall.callerName && chat) {
            setIncomingCall(prev => prev ? { ...prev, callerName: partnerName, callerAvatar: partnerAvatar } : prev);
        }
    }, [incomingCall, chat, partnerName, partnerAvatar, setIncomingCall]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(parseInt(chatId), input);
        setInput("");
        inputRef.current?.focus();
    };

    const handleContextMenu = (e, msg) => {
        if (msg.sender_id !== user?.id) return;
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, messageId: msg.id, content: msg.content });
    };

    const handleEdit = () => {
        if (!contextMenu) return;
        setEditingId(contextMenu.messageId);
        setEditContent(contextMenu.content);
        setContextMenu(null);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editContent.trim()) return;
        editMessage(editingId, editContent);
        setEditingId(null);
        setEditContent("");
    };

    const handleDelete = () => {
        if (!contextMenu) return;
        deleteMessage(contextMenu.messageId);
        setContextMenu(null);
    };

    const handleStartCall = () => {
        startCall(parseInt(chatId));
        navigate(`/call/${chatId}`, {
            state: { partnerName, partnerAvatar }
        });
    };

    const handleAcceptCall = () => {
        acceptCall();
        navigate(`/call/${incomingCall.chatId}`, {
            state: { partnerName: incomingCall.callerName || partnerName, partnerAvatar: incomingCall.callerAvatar || partnerAvatar }
        });
    };

    const handleRejectCall = () => {
        rejectCall();
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const formatDateSeparator = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
        return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    };

    const getDateFromMsg = (msg) => new Date(msg.created_at).toDateString();
    let lastDate = null;

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--color-paper-white)", borderBottom: "2px solid var(--color-ink)", flexShrink: 0, position: "relative", zIndex: 10 }}>
                {/* Washi tape at bottom */}
                <div className="washi-tape-green washi-tape" style={{ position: "absolute", bottom: -12, left: 0, right: 0, height: 12, borderRadius: 0, opacity: 0.45 }} />

                <button
                    className="paper-btn paper-btn-small"
                    style={{ padding: "6px 12px", fontSize: 16 }}
                    onClick={() => navigate("/home")}
                >
                    &larr;
                </button>
                <div className="paper-avatar" style={{ width: 36, height: 36, fontSize: 15, position: "relative" }}>
                    {partnerAvatar ? (
                        <img src={partnerAvatar} alt={partnerName} />
                    ) : (
                        <span>{getInitial(partnerName)}</span>
                    )}
                    <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: "var(--color-crayon-green)", border: "2px solid var(--color-paper-white)" }} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-brand)", fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{partnerName}</div>
                    <div style={{ fontFamily: "var(--font-note)", fontSize: 11, color: "var(--color-pencil)" }}>online now</div>
                </div>

                {/* Video call button */}
                <button
                    className="chat-call-btn"
                    onClick={handleStartCall}
                    title="Video call"
                    disabled={callStatus !== "idle"}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                </button>
            </div>

            {/* Messages area — notebook lines */}
            <div className="notebook-lines notebook-margin" style={{ flex: 1, overflowY: "auto", padding: "20px 16px", position: "relative", zIndex: 5 }}>
                <div style={{ maxWidth: 700, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
                    {loadingMessages ? (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
                            <div className="pencil-loading" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                            <p style={{ fontFamily: "var(--font-label)", fontSize: 16, color: "var(--color-pencil)" }}>
                                No notes yet — say hello!
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const msgDate = getDateFromMsg(msg);
                            const showDateSep = msgDate !== lastDate;
                            lastDate = msgDate;
                            const isOwn = msg.sender_id === user?.id;

                            return (
                                <div key={msg.id}>
                                    {showDateSep && (
                                        <div className="date-separator">
                                            <span>{formatDateSeparator(msg.created_at)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start", paddingBottom: 2 }}>
                                        <div
                                            className={isOwn ? "bubble-sent" : "bubble-received"}
                                            style={{ padding: "10px 14px" }}
                                            onContextMenu={(e) => handleContextMenu(e, msg)}
                                        >
                                            {editingId === msg.id ? (
                                                <form onSubmit={handleEditSubmit} style={{ display: "flex", gap: 4 }}>
                                                    <input
                                                        className="paper-input"
                                                        style={{ padding: "4px 10px", fontSize: 14, borderRadius: 8 }}
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <button className="paper-btn paper-btn-success paper-btn-small" type="submit" style={{ padding: "4px 10px" }}>ok</button>
                                                    <button className="paper-btn paper-btn-small" type="button" onClick={() => setEditingId(null)} style={{ padding: "4px 10px" }}>x</button>
                                                </form>
                                            ) : (
                                                <div style={{ fontFamily: "var(--font-body)", fontSize: 15 }}>{msg.content}</div>
                                            )}
                                            <div style={{ fontFamily: "var(--font-label)", fontSize: 10, color: "var(--color-pencil)", marginTop: 4, opacity: 0.7 }}>
                                                {formatTime(msg.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="paper-context-menu"
                    style={{ position: "fixed", top: contextMenu.y, left: contextMenu.x, zIndex: 50, minWidth: 140 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="paper-context-menu-item" onClick={handleEdit}>Edit</div>
                    <div className="paper-context-menu-item" onClick={handleDelete}>Delete</div>
                </div>
            )}

            {/* Composer */}
            <div className="spiral-binding" style={{ borderTop: "2px solid var(--color-ink)", position: "relative", zIndex: 10, flexShrink: 0, background: "var(--color-paper-white)" }}>
                <form onSubmit={handleSend} style={{ display: "flex", padding: "12px 16px", gap: 8, alignItems: "center" }}>
                    <input
                        ref={inputRef}
                        className="paper-input"
                        type="text"
                        placeholder="Write a note..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button className="paper-btn paper-btn-primary" type="submit" style={{ padding: "8px 20px" }}>
                        Send
                    </button>
                </form>
            </div>

            {/* Incoming call overlay */}
            {incomingCall && (
                <div className="incoming-call-overlay">
                    <div className="incoming-call-card">
                        <div className="incoming-call-label">
                            <span className="phone-ring-anim">📞</span> Incoming Call
                        </div>

                        <div className="incoming-call-avatar">
                            {(incomingCall.callerAvatar || partnerAvatar) ? (
                                <img src={incomingCall.callerAvatar || partnerAvatar} alt={incomingCall.callerName || partnerName} />
                            ) : (
                                <span>{getInitial(incomingCall.callerName || partnerName)}</span>
                            )}
                            <div className="pulse-ring" />
                            <div className="pulse-ring pulse-ring-delay" />
                        </div>

                        <div className="incoming-call-name">{incomingCall.callerName || partnerName}</div>
                        <div className="incoming-call-subtitle">wants to video chat with you</div>

                        <div className="incoming-call-actions">
                            <button
                                className="incoming-action-btn incoming-action-reject"
                                onClick={handleRejectCall}
                                data-label="Decline"
                            >
                                ✕
                            </button>
                            <button
                                className="incoming-action-btn incoming-action-accept"
                                onClick={handleAcceptCall}
                                data-label="Accept"
                            >
                                ✓
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useVideoCall } from "../context/useVideoCall";

export default function HomePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { chats, requests, acceptRequest, rejectRequest, loadRequests, messages, loadingMessages, sendMessage, editMessage, deleteMessage, switchChat, activeChat } = useChat();
    const { incomingCall, startCall, acceptCall, rejectCall, callStatus } = useVideoCall();
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    // Chat panel state
    const [input, setInput] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [contextMenu, setContextMenu] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        loadRequests();
    }, []);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Close context menu on click
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const filteredChats = chats.filter((chat) => {
        if (search.trim()) {
            return chat.partner_name?.toLowerCase().includes(search.toLowerCase());
        }
        return true;
    });

    const handleChatClick = (chat) => {
        switchChat(chat);
        setInput("");
        setEditingId(null);
        setContextMenu(null);
    };

    // Chat panel handlers
    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || !activeChat) return;
        sendMessage(activeChat.id, input);
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

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };


    const handleBackToSidebar = () => {
        switchChat(null);
    };

    // Video call handlers
    const handleStartCall = () => {
        if (!activeChat) return;
        startCall(activeChat.id);
        navigate(`/call/${activeChat.id}`, {
            state: { partnerName: activeChat.partner_name, partnerAvatar: activeChat.partner_avatar }
        });
    };

    const handleAcceptCall = () => {
        acceptCall();
        const cId = incomingCall.chatId;
        navigate(`/call/${cId}`, {
            state: { partnerName: incomingCall.callerName || activeChat?.partner_name, partnerAvatar: incomingCall.callerAvatar || activeChat?.partner_avatar }
        });
    };

    const handleRejectCall = () => {
        rejectCall();
    };

    return (
        <div className="home-layout">
            {/* ===== TOP HEADER ===== */}
            <header className="paper-header">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="paper-avatar anim-bounce" style={{ width: 40, height: 40, background: "var(--color-crayon-purple)", color: "white", cursor: "pointer" }} onClick={() => navigate("/profile")}>
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.username} />
                        ) : (
                            <span>{getInitial(user?.username)}</span>
                        )}
                    </div>
                    <div className="paper-logo">PAPERCHAT</div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <button className="paper-btn paper-btn-primary anim-pop" onClick={() => navigate("/add-user")}>
                        Add
                    </button>
                    <button className="paper-btn anim-pop" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <div className="paper-main-container">
                {/* ===== SIDEBAR ===== */}
                <div className={`paper-sidebar${activeChat ? " hide-mobile" : ""}`}>
                    {/* Search */}
                    <div style={{ marginBottom: 16 }}>
                        <input
                            className="paper-input"
                            type="text"
                            placeholder="Search notes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filter tabs */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                        {["all", "pinned", "unread"].map((f) => (
                            <button
                                key={f}
                                className={`paper-tab ${filter === f ? "active" : ""}`}
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div style={{ borderBottom: "2px dashed var(--color-paper-tan)", marginBottom: 16 }} />

                    {/* Friend Requests */}
                    {requests.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                            <div className="section-label">Friend Requests ({requests.length})</div>
                            {requests.map((req) => (
                                <div key={req.id} className="request-card anim-slideUp">
                                    <div className="paper-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                                        {req.sender_avatar ? <img src={req.sender_avatar} alt={req.sender_username} /> : <span>{getInitial(req.sender_username)}</span>}
                                    </div>
                                    <div style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }} className="font-label">{req.sender_username}</div>
                                    <button className="paper-icon-btn success" onClick={() => acceptRequest(req.id)}>✓</button>
                                    <button className="paper-icon-btn danger" onClick={() => rejectRequest(req.id)}>✕</button>
                                </div>
                            ))}
                            <div style={{ borderBottom: "2px dashed var(--color-paper-tan)", margin: "16px 0" }} />
                        </div>
                    )}

                    <div className="section-label" style={{ marginBottom: 8 }}>&rarr; Recent Chats</div>

                    {/* Chat list */}
                    <div className="chat-list">
                        {filteredChats.length === 0 ? (
                            <div className="empty-state-sidebar">
                                <p>No conversations yet</p>
                            </div>
                        ) : (
                            filteredChats.map((chat, i) => (
                                <div
                                    key={chat.id}
                                    className={`chat-item anim-slideUp delay-${Math.min(i + 1, 5)} ${activeChat?.id === chat.id ? "active" : ""}`}
                                    onClick={() => handleChatClick(chat)}
                                >
                                    <div className="paper-avatar" style={{ width: 44, height: 44, fontSize: 18 }}>
                                        {chat.partner_avatar ? <img src={chat.partner_avatar} alt={chat.partner_name} /> : <span>{getInitial(chat.partner_name)}</span>}
                                        <div className="online-dot" />
                                    </div>
                                    <div className="chat-info">
                                        <div className="chat-name">{chat.partner_name}</div>
                                        {chat.last_message && <div className="chat-preview">{chat.last_message}</div>}
                                    </div>
                                    {/* Unread count / Selection indicator */}
                                    {activeChat?.id === chat.id ? (
                                        <div className="selection-circle filled" />
                                    ) : (
                                        <div className="selection-circle" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ===== CHAT AREA ===== */}
                <div className={`paper-chat-area${activeChat ? " show-mobile" : ""}`}>
                    <div className="paper-chat-container">
                        {activeChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="chat-header">
                                    <div className="mobile-back" onClick={handleBackToSidebar}>&larr;</div>
                                    <div className="paper-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                                        {activeChat.partner_avatar ? <img src={activeChat.partner_avatar} alt={activeChat.partner_name} /> : <span>{getInitial(activeChat.partner_name)}</span>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="chat-header-name">{activeChat.partner_name}</div>
                                    </div>
                                    <div className="chat-actions">
                                        <button
                                            className="chat-call-btn"
                                            onClick={handleStartCall}
                                            title="Video call"
                                            disabled={callStatus !== "idle"}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="23 7 16 12 23 17 23 7" />
                                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="chat-messages notebook-lines">
                                    <div className="messages-inner">
                                        {loadingMessages ? (
                                            <div className="loading-container"><div className="pencil-loading" /></div>
                                        ) : messages.length === 0 ? (
                                            <div className="empty-chat">
                                                <p>No notes yet — say hello!</p>
                                            </div>
                                        ) : (
                                            messages.map((msg) => {
                                                const isOwn = msg.sender_id === user?.id;
                                                return (
                                                    <div key={msg.id} className={`message-row ${isOwn ? "sent" : "received"}`}>
                                                        <div
                                                            className={`message-bubble ${isOwn ? "sent" : "received"}`}
                                                            onContextMenu={(e) => handleContextMenu(e, msg)}
                                                        >
                                                            {editingId === msg.id ? (
                                                                <form onSubmit={handleEditSubmit} className="edit-form">
                                                                    <input className="paper-input-mini" value={editContent} onChange={(e) => setEditContent(e.target.value)} autoFocus />
                                                                    <button type="submit" className="paper-btn-mini success">ok</button>
                                                                    <button type="button" className="paper-btn-mini" onClick={() => setEditingId(null)}>x</button>
                                                                </form>
                                                            ) : (
                                                                <div className="message-content">{msg.content}</div>
                                                            )}
                                                            <div className="message-time">{formatTime(msg.created_at)}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                {/* Input Area */}
                                <div className="chat-input-area">
                                    <form onSubmit={handleSend} className="chat-form">
                                        <input
                                            ref={inputRef}
                                            className="paper-input"
                                            type="text"
                                            placeholder="Write a note..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                        />
                                        <button className="paper-btn paper-btn-primary" type="submit">Send</button>
                                    </form>
                                </div>

                                {/* Context Menu */}
                                {contextMenu && (
                                    <div className="paper-context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()}>
                                        <div className="paper-context-menu-item" onClick={handleEdit}>Edit</div>
                                        <div className="paper-context-menu-item" onClick={handleDelete}>Delete</div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-chat-selected">
                                <div className="paper-logo large">PAPERCHAT</div>
                                <p>Select a conversation to start reading notes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Incoming call overlay */}
            {incomingCall && (
                <div className="incoming-call-overlay">
                    <div className="incoming-call-card">
                        <div className="incoming-call-label">
                            <span className="phone-ring-anim">📞</span> Incoming Call
                        </div>

                        <div className="incoming-call-avatar">
                            {(incomingCall.callerAvatar || activeChat?.partner_avatar) ? (
                                <img src={incomingCall.callerAvatar || activeChat?.partner_avatar} alt={incomingCall.callerName || activeChat?.partner_name || "Caller"} />
                            ) : (
                                <span>{getInitial(incomingCall.callerName || activeChat?.partner_name)}</span>
                            )}
                            <div className="pulse-ring" />
                            <div className="pulse-ring pulse-ring-delay" />
                        </div>

                        <div className="incoming-call-name">{incomingCall.callerName || activeChat?.partner_name || "Someone"}</div>
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

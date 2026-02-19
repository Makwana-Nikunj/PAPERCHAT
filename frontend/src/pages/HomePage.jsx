import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

export default function HomePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { chats, requests, acceptRequest, rejectRequest, loadRequests } = useChat();
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedChat, setSelectedChat] = useState(null);

    useEffect(() => {
        loadRequests();
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
        setSelectedChat(chat.id);
        navigate(`/chat/${chat.id}`, { state: { chat } });
    };

    return (
        <div className="home-layout">
            {/* ===== SIDEBAR ===== */}
            <div className="home-sidebar" style={{ position: "relative" }}>
                {/* Tape decoration at top — desktop only */}
                <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%) rotate(1deg)", width: 90, zIndex: 3 }} className="hide-mobile">
                    <div className="tape-strip" style={{ height: 18, background: "rgba(196, 181, 253, 0.35)", borderColor: "rgba(139, 92, 246, 0.2)" }} />
                </div>

                {/* Header */}
                <div style={{ padding: "20px 16px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="paper-avatar" style={{ width: 34, height: 34, fontSize: 14, cursor: "pointer", background: "var(--color-crayon-purple)", color: "white" }} onClick={() => navigate("/profile")}>
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.username} />
                        ) : (
                            <span>{getInitial(user?.username)}</span>
                        )}
                    </div>
                    <h1 style={{ fontFamily: "var(--font-brand)", fontSize: 26, fontWeight: 700, lineHeight: 1, flex: 1 }}>
                        PAPERCHAT
                    </h1>
                    <div style={{ display: "flex", gap: 6 }}>
                        <button className="paper-btn paper-btn-primary paper-btn-small" style={{ transform: "none" }} onClick={() => navigate("/add-user")}>
                            Add
                        </button>
                        <button className="paper-btn paper-btn-small" style={{ transform: "none" }} onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div style={{ padding: "0 16px 10px" }}>
                    <input
                        className="paper-input"
                        type="text"
                        placeholder="Search notes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ fontSize: 14, padding: "8px 14px", borderRadius: 12 }}
                    />
                </div>

                {/* Filter tabs */}
                <div style={{ padding: "0 16px 10px", display: "flex", gap: 6 }}>
                    {["all", "pinned", "unread"].map((f) => (
                        <button
                            key={f}
                            className="paper-btn paper-btn-small"
                            style={{
                                padding: "4px 14px",
                                fontSize: 12,
                                borderRadius: 20,
                                background: filter === f ? "var(--color-crayon-yellow)" : "var(--color-paper-white)",
                                fontWeight: filter === f ? 700 : 400,
                                transform: "none",
                                borderWidth: 1.5
                            }}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Dashed separator */}
                <div style={{ borderBottom: "2px dashed var(--color-paper-tan)", margin: "0 16px" }} />

                {/* Friend Requests */}
                {requests.length > 0 && (
                    <div style={{ padding: "10px 16px 0" }}>
                        <div style={{ fontFamily: "var(--font-brand)", fontSize: 16, fontWeight: 600, color: "var(--color-ink)", marginBottom: 8, paddingLeft: 4 }}>
                            Friend Requests ({requests.length})
                        </div>
                        {requests.map((req) => (
                            <div key={req.id} className="note-card anim-slideUp" style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, marginBottom: 6 }}>
                                <div className="paper-avatar" style={{ width: 34, height: 34, fontSize: 14, position: "relative" }}>
                                    {req.sender_avatar ? (
                                        <img src={req.sender_avatar} alt={req.sender_username} />
                                    ) : (
                                        <span>{getInitial(req.sender_username)}</span>
                                    )}
                                    <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: "var(--color-crayon-green)", border: "2px solid var(--color-paper-white)" }} />
                                </div>
                                <div style={{ flex: 1, fontFamily: "var(--font-label)", fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{req.sender_username}</div>
                                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                                    <button className="paper-btn paper-btn-success paper-btn-small" style={{ padding: "3px 10px", fontSize: 11 }} onClick={() => acceptRequest(req.id)}>
                                        Accept
                                    </button>
                                    <button className="paper-btn paper-btn-danger paper-btn-small" style={{ padding: "3px 8px", fontSize: 11 }} onClick={() => rejectRequest(req.id)}>
                                        x
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div style={{ borderBottom: "2px dashed var(--color-paper-tan)", margin: "6px 0" }} />
                    </div>
                )}

                {/* Section title */}
                <div style={{ padding: "10px 20px 6px", fontFamily: "var(--font-brand)", fontSize: 16, fontWeight: 600, color: "var(--color-ink)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "var(--color-pencil)" }}>&rarr;</span> Recent Chats
                </div>

                {/* Chat list */}
                <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
                    {filteredChats.length === 0 ? (
                        <div style={{ padding: "40px 16px", textAlign: "center" }}>
                            <p style={{ fontFamily: "var(--font-label)", fontSize: 15, color: "var(--color-pencil)", marginBottom: 12 }}>No conversations yet</p>
                            <p style={{ fontFamily: "var(--font-note)", fontSize: 13, color: "var(--color-pencil)", marginBottom: 16 }}>Add a friend to start passing notes</p>
                            <button className="paper-btn paper-btn-primary" onClick={() => navigate("/add-user")}>
                                Add Your First Friend
                            </button>
                        </div>
                    ) : (
                        filteredChats.map((chat, i) => (
                            <div
                                key={chat.id}
                                className={`note-card anim-slideUp delay-${Math.min(i + 1, 5)}`}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: 10,
                                    marginBottom: 6,
                                    background: selectedChat === chat.id ? "var(--color-crayon-yellow)" : "var(--color-paper-white)"
                                }}
                                onClick={() => handleChatClick(chat)}
                            >
                                {/* Avatar with online dot */}
                                <div className="paper-avatar" style={{ width: 40, height: 40, fontSize: 16, position: "relative" }}>
                                    {chat.partner_avatar ? (
                                        <img src={chat.partner_avatar} alt={chat.partner_name} />
                                    ) : (
                                        <span>{getInitial(chat.partner_name)}</span>
                                    )}
                                    <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: "var(--color-crayon-green)", border: "2px solid var(--color-paper-white)" }} />
                                </div>

                                {/* Name + last message */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontFamily: "var(--font-label)", fontSize: 14, fontWeight: 600 }}>{chat.partner_name}</div>
                                    {chat.last_message && (
                                        <div style={{ fontFamily: "var(--font-note)", fontSize: 12, color: "var(--color-pencil)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.last_message}</div>
                                    )}
                                </div>

                                {/* Selection circle */}
                                <div style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: "50%",
                                    border: "2px solid var(--color-ink)",
                                    background: selectedChat === chat.id ? "var(--color-ink)" : "transparent",
                                    flexShrink: 0,
                                    transition: "background 0.2s ease"
                                }} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ===== MAIN AREA (desktop only) ===== */}
            <div className="home-main notebook-lines notebook-margin" style={{ position: "relative" }}>
                {/* Washi tape at top */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3 }}>
                    <div style={{ borderBottom: "2px dashed var(--color-paper-tan)" }}>
                        <div className="washi-tape-pink washi-tape" style={{ height: 8, borderRadius: 0, opacity: 0.4 }} />
                    </div>
                </div>

                {/* Empty state */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontFamily: "var(--font-brand)", fontSize: 32, color: "var(--color-paper-tan)" }}>
                        PAPERCHAT
                    </div>
                    <p style={{ fontFamily: "var(--font-note)", fontSize: 15, color: "var(--color-pencil)" }}>
                        Select a conversation to start reading notes
                    </p>
                </div>
            </div>
        </div>
    );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useChat } from "../context/ChatContext";

export default function AddUserPage() {
    const navigate = useNavigate();
    const { sendRequest } = useChat();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sentIds, setSentIds] = useState(new Set());
    const [error, setError] = useState("");

    const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true); setError(""); setSearched(true);
        try {
            const res = await api.get(`/users/search?query=${encodeURIComponent(query.trim())}`);
            setResults(res.data || []);
        } catch (err) {
            setError(err.message);
            setResults([]);
        } finally { setLoading(false); }
    };

    const handleAdd = async (userId) => {
        try {
            await sendRequest(userId);
            setSentIds((prev) => new Set(prev).add(userId));
        } catch (err) { setError(err.message); }
    };

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "var(--color-paper-white)", borderBottom: "2px solid var(--color-ink)", flexShrink: 0, position: "relative" }}>
                <div className="washi-tape washi-tape-pink" style={{ position: "absolute", bottom: -12, left: 0, right: 0, height: 12, borderRadius: 0, opacity: 0.4 }} />
                <button className="paper-btn paper-btn-small" style={{ padding: "6px 12px", fontSize: 16 }} onClick={() => navigate("/home")}>
                    &larr;
                </button>
                <h1 style={{ fontFamily: "var(--font-brand)", fontSize: 24, fontWeight: 700 }}>Add Friend</h1>
            </div>

            {/* Search */}
            <div style={{ position: "relative", zIndex: 5 }}>
                <div style={{ maxWidth: 600, margin: "0 auto" }}>
                    <form onSubmit={handleSearch}>
                        <div style={{ display: "flex", padding: "16px 20px", gap: 8 }}>
                            <input
                                className="paper-input"
                                type="text"
                                placeholder="Search by username..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button
                                className="paper-btn paper-btn-primary"
                                type="submit"
                                disabled={loading}
                                style={{ opacity: loading ? 0.5 : 1, padding: "8px 20px" }}
                            >
                                {loading ? "..." : "Search"}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div style={{ padding: "0 20px 12px" }}>
                            <div className="paper-alert paper-alert-error anim-scaleIn">{error}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            <div style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 5 }}>
                <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px 20px" }}>
                    {searched && results.length === 0 && !loading && (
                        <div style={{ textAlign: "center", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                            <p style={{ fontFamily: "var(--font-note)", fontSize: 15, color: "var(--color-pencil)" }}>
                                No notebooks found for "<span style={{ fontFamily: "var(--font-label)", color: "var(--color-ink)" }}>{query}</span>"
                            </p>
                        </div>
                    )}
                    {results.length > 0 && (
                        <div className="paper-card anim-foldIn" style={{ padding: 0, overflow: "hidden", transform: "rotate(-0.3deg)" }}>
                            {results.map((u, i) => (
                                <div
                                    key={u.id}
                                    className={`anim-slideUp delay-${Math.min(i + 1, 5)}`}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "14px 16px",
                                        gap: 12,
                                        borderBottom: i < results.length - 1 ? "1px dashed var(--color-paper-tan)" : "none",
                                        transition: "background 0.2s ease"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-paper-cream)"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                    <div className="paper-avatar">
                                        {u.avatar ? (
                                            <img src={u.avatar} alt={u.username} />
                                        ) : (
                                            <span>{getInitial(u.username)}</span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, fontFamily: "var(--font-label)", fontSize: 15, fontWeight: 600 }}>{u.username}</div>
                                    {sentIds.has(u.id) ? (
                                        <span className="paper-tag paper-tag-green anim-scaleIn" style={{ fontWeight: 700 }}>
                                            Sent
                                        </span>
                                    ) : (
                                        <button className="paper-btn paper-btn-primary paper-btn-small" onClick={() => handleAdd(u.id)}>
                                            Add
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

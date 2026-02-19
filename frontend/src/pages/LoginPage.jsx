import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isRegister) {
                const formData = new FormData();
                formData.append("username", username);
                formData.append("email", email);
                formData.append("password", password);
                if (avatarFile) formData.append("avatar", avatarFile);
                await register(formData);
            } else {
                await login(email, password);
            }
            navigate("/home");
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div className="paper-card anim-foldIn" style={{ width: "100%", maxWidth: 420, padding: 0, overflow: "hidden", transform: "rotate(0.5deg)" }}>
                {/* Washi tape header */}
                <div className="washi-tape" style={{ borderRadius: 0 }} />

                {/* Header */}
                <div style={{ padding: "24px 32px 12px" }}>
                    <h1 style={{ fontFamily: "var(--font-brand)", fontSize: 32, fontWeight: 700, marginBottom: 2 }}>
                        PAPERCHAT
                    </h1>
                    <p style={{ fontFamily: "var(--font-note)", fontSize: 15, color: "var(--color-pencil)" }}>
                        {isRegister ? "create your notebook" : "welcome back"}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ padding: "12px 32px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                        {error && (
                            <div className="paper-alert paper-alert-error anim-scaleIn">
                                {error}
                            </div>
                        )}

                        {isRegister && (
                            <div className="anim-slideUp">
                                <label className="paper-label">Username</label>
                                <input
                                    className="paper-input"
                                    type="text"
                                    placeholder="your name here..."
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="paper-label">Email</label>
                            <input
                                className="paper-input"
                                type="email"
                                placeholder="your email..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="paper-label">Password</label>
                            <input
                                className="paper-input"
                                type="password"
                                placeholder="secret password..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {isRegister && (
                            <div className="anim-slideUp">
                                <label className="paper-label">Avatar</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div className="paper-avatar" style={{ width: 52, height: 52, fontSize: 22 }}>
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Preview" />
                                        ) : (
                                            <span>?</span>
                                        )}
                                    </div>
                                    <label className="paper-btn paper-btn-small" style={{ cursor: "pointer" }}>
                                        Choose File
                                        <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                                    </label>
                                </div>
                            </div>
                        )}

                        <button
                            className="paper-btn paper-btn-primary"
                            type="submit"
                            disabled={loading}
                            style={{ width: "100%", fontSize: 16, padding: "12px 20px", marginTop: 4, opacity: loading ? 0.6 : 1 }}
                        >
                            {loading ? "Please wait..." : isRegister ? "Create Account" : "Open Notebook"}
                        </button>
                    </div>
                </form>

                {/* Footer toggle */}
                <div style={{ padding: "16px 32px", borderTop: "2px dashed var(--color-paper-tan)", textAlign: "center", fontFamily: "var(--font-note)", fontSize: 15, color: "var(--color-pencil)" }}>
                    {isRegister ? (
                        <>
                            already have a notebook?{" "}
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(false); setError(""); }} style={{ color: "var(--color-ink-blue)", fontWeight: 600, textDecoration: "none", borderBottom: "2px solid var(--color-crayon-yellow)" }}>
                                open it
                            </a>
                        </>
                    ) : (
                        <>
                            need a new notebook?{" "}
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(true); setError(""); }} style={{ color: "var(--color-ink-blue)", fontWeight: 600, textDecoration: "none", borderBottom: "2px solid var(--color-crayon-yellow)" }}>
                                create one
                            </a>
                        </>
                    )}
                </div>

                {/* Bottom tape */}
                <div className="washi-tape-pink washi-tape" style={{ borderRadius: 0, height: 20 }} />
            </div>
        </div>
    );
}

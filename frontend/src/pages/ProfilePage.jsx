import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const [editMode, setEditMode] = useState(null);
    const [newUsername, setNewUsername] = useState(user?.username || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

    const handleChangeUsername = async (e) => {
        e.preventDefault();
        setError(""); setSuccess(""); setLoading(true);
        try {
            const res = await api.patch("/users/change-username", { username: newUsername });
            updateUser(res.data);
            setSuccess("Username updated!");
            setEditMode(null);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError(""); setSuccess(""); setLoading(true);
        try {
            await api.patch("/users/change-password", { currentPassword, newPassword });
            setSuccess("Password changed!");
            setEditMode(null);
            setCurrentPassword(""); setNewPassword("");
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleChangeAvatar = async (e) => {
        e.preventDefault();
        if (!avatarFile) return;
        setError(""); setSuccess(""); setLoading(true);
        try {
            const formData = new FormData();
            formData.append("avatar", avatarFile);
            const res = await api.patch("/users/change-avatar", formData);
            updateUser(res.data);
            setSuccess("Avatar updated!");
            setEditMode(null);
            setAvatarFile(null); setAvatarPreview(null);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];
        if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
    };

    const tabBtn = (label, mode) => (
        <button
            className="paper-btn paper-btn-small"
            style={{
                flex: 1,
                borderRadius: 0,
                background: editMode === mode ? "var(--color-crayon-yellow)" : "var(--color-paper-white)",
                fontWeight: editMode === mode ? 700 : 400,
                transform: editMode === mode ? "scale(1.02)" : "none",
                borderRight: "1px solid var(--color-ink)"
            }}
            onClick={() => setEditMode(mode)}
        >
            {label}
        </button>
    );

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "var(--color-paper-white)", borderBottom: "2px solid var(--color-ink)", flexShrink: 0, position: "relative" }}>
                <div className="washi-tape-purple washi-tape" style={{ position: "absolute", bottom: -12, left: 0, right: 0, height: 12, borderRadius: 0, opacity: 0.4 }} />
                <button className="paper-btn paper-btn-small" style={{ padding: "6px 12px", fontSize: 16 }} onClick={() => navigate("/home")}>
                    &larr;
                </button>
                <h1 style={{ fontFamily: "var(--font-brand)", fontSize: 24, fontWeight: 700 }}>Profile</h1>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px", gap: 20, overflowY: "auto" }}>
                <div style={{ maxWidth: 440, width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
                    {error && <div className="paper-alert paper-alert-error anim-scaleIn">{error}</div>}
                    {success && <div className="paper-alert paper-alert-success anim-scaleIn">{success}</div>}

                    {/* Profile Card */}
                    <div className="paper-card folded-corner anim-foldIn" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 24px 28px", gap: 12, transform: "rotate(-0.5deg)", position: "relative" }}>
                        {/* Washi tape */}
                        <div className="washi-tape" style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%) rotate(1deg)", width: 100, zIndex: 2 }} />

                        <div className="paper-avatar paper-avatar-lg">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.username} />
                            ) : (
                                <span>{getInitial(user?.username)}</span>
                            )}
                        </div>
                        <div style={{ fontFamily: "var(--font-brand)", fontSize: 28, fontWeight: 700, marginTop: 4 }}>{user?.username}</div>
                        <div style={{ fontFamily: "var(--font-note)", fontSize: 14, color: "var(--color-pencil)" }}>{user?.email}</div>
                        <button
                            className="paper-btn paper-btn-primary"
                            style={{ marginTop: 8 }}
                            onClick={() => { setEditMode(editMode ? null : "username"); setError(""); setSuccess(""); }}
                        >
                            {editMode ? "Cancel Edit" : "Edit Profile"}
                        </button>
                    </div>

                    {/* Edit Sections */}
                    {editMode && (
                        <div className="paper-card dashed-border anim-unfold" style={{ padding: 0, overflow: "hidden" }}>
                            {/* Tabs */}
                            <div style={{ display: "flex", borderBottom: "2px solid var(--color-ink)" }}>
                                {tabBtn("Username", "username")}
                                {tabBtn("Avatar", "avatar")}
                                {tabBtn("Password", "password")}
                            </div>

                            <div style={{ padding: 20 }}>
                                {editMode === "username" && (
                                    <form onSubmit={handleChangeUsername} style={{ display: "flex", flexDirection: "column", gap: 14 }} className="anim-slideUp">
                                        <div>
                                            <label className="paper-label">New Username</label>
                                            <input className="paper-input" type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
                                        </div>
                                        <button className="paper-btn paper-btn-success" type="submit" disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>
                                            {loading ? "Saving..." : "Save Username"}
                                        </button>
                                    </form>
                                )}

                                {editMode === "avatar" && (
                                    <form onSubmit={handleChangeAvatar} style={{ display: "flex", flexDirection: "column", gap: 14 }} className="anim-slideUp">
                                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                            <div className="paper-avatar" style={{ width: 72, height: 72, fontSize: 28 }}>
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} alt="Preview" />
                                                ) : user?.avatar ? (
                                                    <img src={user.avatar} alt={user.username} />
                                                ) : (
                                                    <span>{getInitial(user?.username)}</span>
                                                )}
                                            </div>
                                            <label className="paper-btn paper-btn-small" style={{ cursor: "pointer" }}>
                                                Choose File
                                                <input type="file" accept="image/*" onChange={handleAvatarSelect} hidden />
                                            </label>
                                        </div>
                                        <button className="paper-btn paper-btn-success" type="submit" disabled={loading || !avatarFile} style={{ opacity: (loading || !avatarFile) ? 0.5 : 1 }}>
                                            {loading ? "Uploading..." : "Save Avatar"}
                                        </button>
                                    </form>
                                )}

                                {editMode === "password" && (
                                    <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }} className="anim-slideUp">
                                        <div>
                                            <label className="paper-label">Current Password</label>
                                            <input className="paper-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="paper-label">New Password</label>
                                            <input className="paper-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                                        </div>
                                        <button className="paper-btn paper-btn-success" type="submit" disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>
                                            {loading ? "Changing..." : "Change Password"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

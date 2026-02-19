import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            {/* Floating paper scraps */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                <div className="anim-float" style={{ position: "absolute", top: "12%", left: "10%", width: 40, height: 40, background: "var(--color-crayon-yellow)", border: "2px solid var(--color-ink)", borderRadius: 6, opacity: 0.3, transform: "rotate(12deg)" }} />
                <div className="anim-float" style={{ position: "absolute", top: "20%", right: "14%", width: 28, height: 28, background: "var(--color-crayon-pink)", border: "2px solid var(--color-ink)", borderRadius: 4, opacity: 0.25, animationDelay: "1.5s", transform: "rotate(-8deg)" }} />
                <div className="anim-float" style={{ position: "absolute", bottom: "18%", left: "16%", width: 32, height: 32, background: "var(--color-crayon-green)", border: "2px solid var(--color-ink)", borderRadius: 5, opacity: 0.2, animationDelay: "3s", transform: "rotate(20deg)" }} />
                <div className="anim-float" style={{ position: "absolute", top: "55%", right: "10%", width: 36, height: 36, background: "var(--color-crayon-purple)", border: "2px solid var(--color-ink)", borderRadius: 6, opacity: 0.2, animationDelay: "2s", transform: "rotate(-15deg)" }} />
            </div>

            {/* Main card */}
            <div className="paper-card folded-corner anim-foldIn landing-card" style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "56px 64px", transform: "rotate(-1deg)" }}>
                {/* Washi tape at top */}
                <div className="washi-tape" style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%) rotate(2deg)", width: 120, zIndex: 2 }} />

                <h1 style={{ fontFamily: "var(--font-brand)", fontSize: 56, fontWeight: 700, lineHeight: 1.1, marginBottom: 8, color: "var(--color-ink)" }}>
                    PAPERCHAT
                </h1>
                <p style={{ fontFamily: "var(--font-note)", fontSize: 16, color: "var(--color-pencil)", marginBottom: 36, letterSpacing: 1 }}>
                    pass notes to your friends
                </p>
                <button
                    className="paper-btn paper-btn-primary"
                    style={{ fontSize: 18, padding: "12px 48px", borderRadius: 20 }}
                    onClick={() => navigate("/login")}
                >
                    Open Notebook
                </button>

                {/* Decorative tape at bottom */}
                <div className="washi-tape-pink washi-tape" style={{ position: "absolute", bottom: -10, right: 20, width: 80, height: 22, transform: "rotate(-3deg)", zIndex: 2 }} />
            </div>
        </div>
    );
}

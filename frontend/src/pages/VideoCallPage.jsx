import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useVideoCall } from "../context/useVideoCall";

export default function VideoCallPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const partnerName = location.state?.partnerName || "Friend";
    const partnerAvatar = location.state?.partnerAvatar;

    const {
        localStream,
        remoteStream,
        callActive,
        callStatus,
        isVideoEnabled,
        isAudioEnabled,
        endCall,
        toggleVideo,
        toggleAudio
    } = useVideoCall();

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // Attach local stream
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Attach remote stream
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // If call ended (by other side), navigate back
    useEffect(() => {
        if (callStatus === "idle" && !callActive) {
            // Small delay so user can see the call ended
            const timer = setTimeout(() => {
                navigate("/home", { replace: true });
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [callStatus, callActive, navigate]);

    const handleEndCall = () => {
        endCall();
        navigate("/home", { replace: true });
    };

    const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

    return (
        <div className="call-page">
            {/* Paper texture overlay */}
            <div className="call-paper-texture" />

            {/* Remote video — fills the screen */}
            <div className="call-remote-container">
                {remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        className="call-remote-video"
                        autoPlay
                        playsInline
                    />
                ) : (
                    <div className="call-waiting-state">
                        <div className="call-waiting-avatar">
                            {partnerAvatar ? (
                                <img src={partnerAvatar} alt={partnerName} />
                            ) : (
                                <span>{getInitial(partnerName)}</span>
                            )}
                            <div className="pulse-ring" />
                            <div className="pulse-ring pulse-ring-delay" />
                        </div>
                        <div className="call-waiting-text">
                            {callStatus === "calling" ? "Calling..." : callStatus === "ringing" ? "Ringing..." : "Connecting..."}
                        </div>
                        <div className="call-waiting-name">{partnerName}</div>
                        <div className="call-waiting-dots">
                            <span className="call-dot" />
                            <span className="call-dot call-dot-2" />
                            <span className="call-dot call-dot-3" />
                        </div>
                    </div>
                )}
            </div>

            {/* Local video — picture-in-picture */}
            <div className={`call-local-container ${!isVideoEnabled ? "video-off" : ""}`}>
                {localStream ? (
                    <>
                        <video
                            ref={localVideoRef}
                            className="call-local-video"
                            autoPlay
                            playsInline
                            muted
                        />
                        {!isVideoEnabled && (
                            <div className="call-local-off-overlay">
                                <span>📷</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="call-local-placeholder">
                        <span>You</span>
                    </div>
                )}
            </div>

            {/* Partner name tag */}
            {remoteStream && (
                <div className="call-name-tag">
                    <span>{partnerName}</span>
                </div>
            )}

            {/* Controls bar */}
            <div className="call-controls">
                <div className="call-controls-inner">
                    {/* Toggle Audio */}
                    <button
                        className={`call-control-btn ${!isAudioEnabled ? "control-off" : ""}`}
                        onClick={toggleAudio}
                        title={isAudioEnabled ? "Mute" : "Unmute"}
                    >
                        {isAudioEnabled ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="1" y1="1" x2="23" y2="23" />
                                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        )}
                    </button>

                    {/* Toggle Video */}
                    <button
                        className={`call-control-btn ${!isVideoEnabled ? "control-off" : ""}`}
                        onClick={toggleVideo}
                        title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                    >
                        {isVideoEnabled ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="23 7 16 12 23 17 23 7" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        )}
                    </button>

                    {/* End Call */}
                    <button
                        className="call-control-btn control-end"
                        onClick={handleEndCall}
                        title="End call"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                            <line x1="23" y1="1" x2="1" y2="23" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

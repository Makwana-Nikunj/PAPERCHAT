import { createContext, useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "../services/socket";

const VideoCallContext = createContext(null);
export { VideoCallContext };

export function VideoCallProvider({ children }) {

    // Reactively discover the socket — polls until connected
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const check = () => {
            const s = getSocket();
            if (s && s.connected && s !== socketRef.current) {
                socketRef.current = s;
                setSocket(s);
            }
        };

        check();
        const interval = setInterval(check, 500);
        return () => clearInterval(interval);
    }, []);

    const peerRef = useRef(null);
    const chatIdRef = useRef(null);
    const localStreamRef = useRef(null);
    const iceCandidateQueue = useRef([]);

    // Call state
    const [incomingCall, setIncomingCall] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callActive, setCallActive] = useState(false);
    const [callStatus, setCallStatus] = useState("idle");

    // Media toggles
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    // Keep localStreamRef in sync with state
    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    // -----------------------
    // Cleanup helper
    // -----------------------

    const cleanupCall = useCallback(() => {
        if (peerRef.current) {
            try { peerRef.current.close(); } catch { /* ignore */ }
            peerRef.current = null;
        }

        const stream = localStreamRef.current;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        iceCandidateQueue.current = [];
        localStreamRef.current = null;
        setLocalStream(null);
        setRemoteStream(null);
        setCallActive(false);
        setCallStatus("idle");
        setIsVideoEnabled(true);
        setIsAudioEnabled(true);
        chatIdRef.current = null;
        setIncomingCall(null);
    }, []);

    // -----------------------
    // Get Camera + Mic
    // -----------------------

    const getMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            setLocalStream(stream);
            localStreamRef.current = stream;
            return stream;
        } catch (err) {
            console.error("Failed to get media:", err);
            throw err;
        }
    }, []);

    // -----------------------
    // Create Peer Connection
    // Uses socketRef instead of socket to avoid dependency issues
    // -----------------------

    const createPeer = useCallback(() => {
        // Close any existing peer
        if (peerRef.current) {
            try { peerRef.current.close(); } catch { /* ignore */ }
        }

        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
                { urls: "stun:stun2.l.google.com:19302" }
            ]
        });

        peer.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                const sock = socketRef.current;
                if (sock) {
                    sock.emit("webrtc_ice_candidate", {
                        chatId: chatIdRef.current,
                        candidate: event.candidate
                    });
                }
            }
        };

        peer.oniceconnectionstatechange = () => {
            console.log("ICE connection state:", peer.iceConnectionState);
            if (peer.iceConnectionState === "connected" || peer.iceConnectionState === "completed") {
                setCallStatus("active");
            }
        };

        peer.onconnectionstatechange = () => {
            console.log("Peer connection state:", peer.connectionState);
            if (peer.connectionState === "connected") {
                setCallStatus("active");
            }
        };

        peerRef.current = peer;
        return peer;
    }, []); // No dependencies — uses refs

    // -----------------------
    // Start Call (Caller)
    // -----------------------

    const startCall = useCallback((chatId) => {
        const sock = socketRef.current;
        if (!sock) {
            console.error("Cannot start call: socket not connected");
            return;
        }
        chatIdRef.current = chatId;
        setCallStatus("calling");
        console.log("Starting call for chatId:", chatId);
        sock.emit("call_user", { chatId });
    }, []);

    // -----------------------
    // Caller creates WebRTC offer after callee accepts
    // -----------------------

    const initiateWebRTC = useCallback(async () => {
        try {
            console.log("Initiating WebRTC (caller side)...");
            const stream = await getMedia();
            const peer = createPeer();

            stream.getTracks().forEach(track => {
                peer.addTrack(track, stream);
            });

            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);

            const sock = socketRef.current;
            if (sock) {
                console.log("Sending offer for chatId:", chatIdRef.current);
                sock.emit("webrtc_offer", {
                    chatId: chatIdRef.current,
                    offer: peer.localDescription
                });
            }

            setCallActive(true);
            setCallStatus("active");
        } catch (err) {
            console.error("Error in initiateWebRTC:", err);
            cleanupCall();
        }
    }, [getMedia, createPeer, cleanupCall]);

    // -----------------------
    // Accept Call (Callee) — creates peer BEFORE notifying caller
    // -----------------------

    const acceptCall = useCallback(async () => {
        if (!incomingCall) return;
        const sock = socketRef.current;
        if (!sock) return;

        try {
            console.log("Accepting call for chatId:", incomingCall.chatId);
            chatIdRef.current = incomingCall.chatId;
            setCallStatus("active");

            const stream = await getMedia();
            const peer = createPeer();

            stream.getTracks().forEach(track => {
                peer.addTrack(track, stream);
            });

            // Only notify caller AFTER our peer is ready
            console.log("Peer ready, emitting call_accepted");
            sock.emit("call_accepted", { chatId: incomingCall.chatId });

            setIncomingCall(null);
            setCallActive(true);
        } catch (err) {
            console.error("Error accepting call:", err);
            cleanupCall();
        }
    }, [incomingCall, getMedia, createPeer, cleanupCall]);

    // -----------------------
    // Reject Call
    // -----------------------

    const rejectCall = useCallback(() => {
        if (!incomingCall) return;
        const sock = socketRef.current;
        if (sock) {
            sock.emit("call_rejected", { chatId: incomingCall.chatId });
        }
        setIncomingCall(null);
        setCallStatus("idle");
    }, [incomingCall]);

    // -----------------------
    // End Call
    // -----------------------

    const endCall = useCallback(() => {
        const currentChatId = chatIdRef.current;
        cleanupCall();
        const sock = socketRef.current;
        if (currentChatId && sock) {
            sock.emit("end_call", { chatId: currentChatId });
        }
    }, [cleanupCall]);

    // -----------------------
    // Toggle Video
    // -----------------------

    const toggleVideo = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoEnabled(videoTrack.enabled);
        }
    }, []);

    // -----------------------
    // Toggle Audio
    // -----------------------

    const toggleAudio = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsAudioEnabled(audioTrack.enabled);
        }
    }, []);

    // -----------------------
    // Ref for initiateWebRTC so socket listeners use latest version
    // -----------------------
    const initiateWebRTCRef = useRef(initiateWebRTC);
    useEffect(() => {
        initiateWebRTCRef.current = initiateWebRTC;
    }, [initiateWebRTC]);

    // -----------------------
    // Socket Events — ONLY depends on socket, uses refs for everything else
    // -----------------------

    useEffect(() => {
        if (!socket) {
            console.log("VideoCallContext: socket not ready yet");
            return;
        }

        console.log("VideoCallContext: registering socket listeners");

        const onIncomingCall = ({ from, chatId }) => {
            console.log("Received incoming_call from:", from, "chatId:", chatId);
            setIncomingCall({
                chatId,
                from,
                callerName: null,
                callerAvatar: null
            });
            setCallStatus("ringing");
        };

        const onCallAccepted = () => {
            console.log("Call accepted, initiating WebRTC...");
            // Use ref to always call the latest version
            initiateWebRTCRef.current();
        };

        const onCallRejected = () => {
            console.log("Call rejected");
            cleanupCall();
        };

        const onWebrtcOffer = async ({ offer, chatId }) => {
            console.log("Received webrtc_offer");
            const peer = peerRef.current;
            if (!peer) {
                console.error("Received offer but peer is null — this shouldn't happen");
                return;
            }
            try {
                await peer.setRemoteDescription(new RTCSessionDescription(offer));

                // Process queued ICE candidates
                while (iceCandidateQueue.current.length > 0) {
                    const candidate = iceCandidateQueue.current.shift();
                    try {
                        await peer.addIceCandidate(candidate);
                    } catch (e) {
                        console.error("Error adding queued ICE candidate:", e);
                    }
                }

                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);

                const sock = socketRef.current;
                if (sock) {
                    console.log("Sending answer for chatId:", chatId || chatIdRef.current);
                    sock.emit("webrtc_answer", {
                        chatId: chatId || chatIdRef.current,
                        answer: peer.localDescription
                    });
                }
            } catch (e) {
                console.error("Error handling WebRTC offer:", e);
            }
        };

        const onWebrtcAnswer = async ({ answer }) => {
            console.log("Received webrtc_answer");
            const peer = peerRef.current;
            if (!peer) return;
            try {
                await peer.setRemoteDescription(new RTCSessionDescription(answer));

                // Process queued ICE candidates
                while (iceCandidateQueue.current.length > 0) {
                    const candidate = iceCandidateQueue.current.shift();
                    try {
                        await peer.addIceCandidate(candidate);
                    } catch (e) {
                        console.error("Error adding queued ICE candidate:", e);
                    }
                }
            } catch (e) {
                console.error("Error handling WebRTC answer:", e);
            }
        };

        const onIceCandidate = async ({ candidate }) => {
            const peer = peerRef.current;
            if (!peer) return;
            if (!peer.remoteDescription || !peer.remoteDescription.type) {
                iceCandidateQueue.current.push(candidate);
                return;
            }
            try {
                await peer.addIceCandidate(candidate);
            } catch (e) {
                console.error("Error adding ICE candidate:", e);
            }
        };

        const onCallEnded = () => {
            console.log("Call ended by remote");
            cleanupCall();
        };

        socket.on("incoming_call", onIncomingCall);
        socket.on("call_accepted", onCallAccepted);
        socket.on("call_rejected", onCallRejected);
        socket.on("webrtc_offer", onWebrtcOffer);
        socket.on("webrtc_answer", onWebrtcAnswer);
        socket.on("webrtc_ice_candidate", onIceCandidate);
        socket.on("call_ended", onCallEnded);

        return () => {
            console.log("VideoCallContext: cleaning up socket listeners");
            socket.off("incoming_call", onIncomingCall);
            socket.off("call_accepted", onCallAccepted);
            socket.off("call_rejected", onCallRejected);
            socket.off("webrtc_offer", onWebrtcOffer);
            socket.off("webrtc_answer", onWebrtcAnswer);
            socket.off("webrtc_ice_candidate", onIceCandidate);
            socket.off("call_ended", onCallEnded);
        };

    }, [socket, cleanupCall]); // Only depends on socket — uses refs for everything else

    return (
        <VideoCallContext.Provider
            value={{
                incomingCall,
                setIncomingCall,
                localStream,
                remoteStream,
                callActive,
                callStatus,
                isVideoEnabled,
                isAudioEnabled,
                startCall,
                acceptCall,
                rejectCall,
                endCall,
                toggleVideo,
                toggleAudio
            }}
        >
            {children}
        </VideoCallContext.Provider>
    );
}
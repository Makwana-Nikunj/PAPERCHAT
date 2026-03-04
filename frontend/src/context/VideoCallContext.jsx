import { createContext, useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "../services/socket";

const VideoCallContext = createContext(null);
export { VideoCallContext };

export function VideoCallProvider({ children }) {

    const socket = getSocket();

    const peerRef = useRef(null);
    const chatIdRef = useRef(null);

    // Call state
    const [incomingCall, setIncomingCall] = useState(null);   // { chatId, from, callerName, callerAvatar }
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callActive, setCallActive] = useState(false);
    const [callStatus, setCallStatus] = useState("idle");     // idle | calling | ringing | active

    // Media toggles
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    // -----------------------
    // Get Camera + Mic
    // -----------------------

    const getMedia = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        setLocalStream(stream);
        return stream;
    }, []);

    // -----------------------
    // Create Peer Connection
    // -----------------------

    const createPeer = useCallback(() => {
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }
            ]
        });

        peer.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("webrtc_ice_candidate", {
                    chatId: chatIdRef.current,
                    candidate: event.candidate
                });
            }
        };

        peer.onconnectionstatechange = () => {
            if (peer.connectionState === "connected") {
                setCallStatus("active");
            }
        };

        peerRef.current = peer;
        return peer;
    }, [socket]);

    // -----------------------
    // Start Call (Caller)
    // -----------------------

    const startCall = useCallback(async (chatId) => {
        chatIdRef.current = chatId;
        setCallStatus("calling");

        // First emit call_user so the other side gets the incoming_call notification
        socket.emit("call_user", { chatId });
    }, [socket]);

    // -----------------------
    // Called when callee accepts — initiator creates the WebRTC offer
    // -----------------------

    const initiateWebRTC = useCallback(async () => {
        const stream = await getMedia();
        const peer = createPeer();

        stream.getTracks().forEach(track => {
            peer.addTrack(track, stream);
        });

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit("webrtc_offer", {
            chatId: chatIdRef.current,
            offer
        });

        setCallActive(true);
        setCallStatus("active");
    }, [socket, getMedia, createPeer]);

    // -----------------------
    // Accept Call (Callee)
    // -----------------------

    const acceptCall = useCallback(async () => {
        if (!incomingCall) return;

        chatIdRef.current = incomingCall.chatId;
        setCallStatus("active");

        // Notify the caller that the call was accepted
        socket.emit("call_accepted", { chatId: incomingCall.chatId });

        const stream = await getMedia();
        const peer = createPeer();

        stream.getTracks().forEach(track => {
            peer.addTrack(track, stream);
        });

        // We'll set the remote description when the offer comes in via socket
        setIncomingCall(null);
        setCallActive(true);
    }, [incomingCall, socket, getMedia, createPeer]);

    // -----------------------
    // Reject Call
    // -----------------------

    const rejectCall = useCallback(() => {
        if (!incomingCall) return;

        socket.emit("call_rejected", { chatId: incomingCall.chatId });
        setIncomingCall(null);
        setCallStatus("idle");
    }, [incomingCall, socket]);

    // -----------------------
    // End Call
    // -----------------------

    const endCall = useCallback(() => {
        peerRef.current?.close();
        peerRef.current = null;

        localStream?.getTracks().forEach(track => track.stop());

        setLocalStream(null);
        setRemoteStream(null);
        setCallActive(false);
        setCallStatus("idle");
        setIsVideoEnabled(true);
        setIsAudioEnabled(true);

        socket.emit("end_call", {
            chatId: chatIdRef.current
        });

        chatIdRef.current = null;
    }, [localStream, socket]);

    // -----------------------
    // Toggle Video
    // -----------------------

    const toggleVideo = useCallback(() => {
        if (!localStream) return;
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoEnabled(videoTrack.enabled);
        }
    }, [localStream]);

    // -----------------------
    // Toggle Audio
    // -----------------------

    const toggleAudio = useCallback(() => {
        if (!localStream) return;
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsAudioEnabled(audioTrack.enabled);
        }
    }, [localStream]);

    // -----------------------
    // Socket Events
    // -----------------------

    useEffect(() => {
        if (!socket) return;

        // Someone is calling us
        socket.on("incoming_call", ({ from, chatId }) => {
            setIncomingCall({
                chatId,
                from,
                callerName: null,   // Will be filled by the ChatPage from chat state
                callerAvatar: null
            });
            setCallStatus("ringing");
        });

        // Our call was accepted — we are the caller, so initiate WebRTC
        socket.on("call_accepted", () => {
            initiateWebRTC();
        });

        // Our call was rejected
        socket.on("call_rejected", () => {
            setCallStatus("idle");
            setCallActive(false);
            chatIdRef.current = null;
        });

        // Receiving WebRTC offer (we are the callee)
        socket.on("webrtc_offer", async ({ offer, chatId }) => {
            const peer = peerRef.current;
            if (!peer) return;

            await peer.setRemoteDescription(offer);
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            socket.emit("webrtc_answer", {
                chatId: chatId || chatIdRef.current,
                answer
            });
        });

        // Receiving WebRTC answer (we are the caller)
        socket.on("webrtc_answer", async ({ answer }) => {
            const peer = peerRef.current;
            if (!peer) return;
            await peer.setRemoteDescription(answer);
        });

        // ICE candidate
        socket.on("webrtc_ice_candidate", async ({ candidate }) => {
            const peer = peerRef.current;
            if (!peer) return;
            try {
                await peer.addIceCandidate(candidate);
            } catch (e) {
                console.error("Error adding ICE candidate:", e);
            }
        });

        // Call ended by the other side
        socket.on("call_ended", () => {
            peerRef.current?.close();
            peerRef.current = null;
            localStream?.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            setRemoteStream(null);
            setCallActive(false);
            setCallStatus("idle");
            setIsVideoEnabled(true);
            setIsAudioEnabled(true);
            chatIdRef.current = null;
        });

        return () => {
            socket.off("incoming_call");
            socket.off("call_accepted");
            socket.off("call_rejected");
            socket.off("webrtc_offer");
            socket.off("webrtc_answer");
            socket.off("webrtc_ice_candidate");
            socket.off("call_ended");
        };

    }, [socket, initiateWebRTC, localStream]);

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
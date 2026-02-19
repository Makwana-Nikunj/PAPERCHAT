import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

let socket = null;

function connectSocket(accessToken) {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
        auth: { accessToken },
        transports: ["websocket"],
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
    });

    return socket;
}

function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

function getSocket() {
    return socket;
}

export { connectSocket, disconnectSocket, getSocket };

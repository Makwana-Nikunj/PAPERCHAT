
// Active call tracking: Map<userId, chatId>
const activeCalls = new Map();

const initCallSocket = (io, socket) => {

    const userId = socket.userId;
    console.log(`[CALL] User ${userId} connected, setting up call handlers`);

    // CALL USER
    socket.on("call_user", ({ chatId }) => {
        if (!chatId) return;
        console.log(`[CALL] User ${userId} calling chatId ${chatId}`);

        activeCalls.set(userId, chatId);

        // Check who's in the room
        const room = io.sockets.adapter.rooms.get(String(chatId));
        console.log(`[CALL] Room ${chatId} members:`, room ? [...room] : "empty");

        socket.to(String(chatId)).emit("incoming_call", {
            from: userId,
            chatId
        });
    });

    // ACCEPT CALL
    socket.on("call_accepted", ({ chatId }) => {
        if (!chatId) return;
        console.log(`[CALL] User ${userId} accepted call in chatId ${chatId}`);

        activeCalls.set(userId, chatId);

        socket.to(String(chatId)).emit("call_accepted", {
            from: userId
        });
    });

    // WEBRTC OFFER
    socket.on("webrtc_offer", ({ chatId, offer }) => {
        if (!chatId || !offer) return;
        console.log(`[CALL] User ${userId} sent offer for chatId ${chatId}`);

        socket.to(String(chatId)).emit("webrtc_offer", {
            from: userId,
            chatId,
            offer
        });
    });

    // WEBRTC ANSWER
    socket.on("webrtc_answer", ({ chatId, answer }) => {
        if (!chatId || !answer) return;
        console.log(`[CALL] User ${userId} sent answer for chatId ${chatId}`);

        socket.to(String(chatId)).emit("webrtc_answer", {
            from: userId,
            answer
        });
    });

    // ICE CANDIDATES
    socket.on("webrtc_ice_candidate", ({ chatId, candidate }) => {
        if (!chatId || !candidate) return;

        socket.to(String(chatId)).emit("webrtc_ice_candidate", {
            candidate
        });
    });

    // REJECT CALL
    socket.on("call_rejected", ({ chatId }) => {
        if (!chatId) return;
        console.log(`[CALL] User ${userId} rejected call in chatId ${chatId}`);

        activeCalls.delete(userId);
        for (const [uid, cid] of activeCalls) {
            if (cid === chatId && uid !== userId) {
                activeCalls.delete(uid);
                break;
            }
        }

        socket.to(String(chatId)).emit("call_rejected", {
            from: userId
        });
    });

    // END CALL
    socket.on("end_call", ({ chatId }) => {
        if (!chatId) return;
        console.log(`[CALL] User ${userId} ended call in chatId ${chatId}`);

        activeCalls.delete(userId);
        for (const [uid, cid] of activeCalls) {
            if (cid === chatId && uid !== userId) {
                activeCalls.delete(uid);
                break;
            }
        }

        socket.to(String(chatId)).emit("call_ended", {
            from: userId
        });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
        const chatId = activeCalls.get(userId);
        if (chatId) {
            console.log(`[CALL] User ${userId} disconnected during active call in chatId ${chatId}`);
            socket.to(String(chatId)).emit("call_ended", {
                from: userId
            });
            activeCalls.delete(userId);
        }
    });

};

export { initCallSocket };
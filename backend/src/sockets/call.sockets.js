
const initCallSocket = (io, socket) => {

    const userId = socket.userId;

    // CALL USER
    socket.on("call_user", ({ chatId }) => {
        if (!chatId) return;

        socket.to(String(chatId)).emit("incoming_call", {
            from: userId,
            chatId
        });
    });

    // ACCEPT CALL
    socket.on("call_accepted", ({ chatId }) => {
        if (!chatId) return;

        socket.to(String(chatId)).emit("call_accepted", {
            from: userId
        });
    });

    // WEBRTC OFFER
    socket.on("webrtc_offer", ({ chatId, offer }) => {
        if (!chatId || !offer) return;

        socket.to(String(chatId)).emit("webrtc_offer", {
            from: userId,
            offer
        });
    });

    // WEBRTC ANSWER
    socket.on("webrtc_answer", ({ chatId, answer }) => {
        if (!chatId || !answer) return;

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

        socket.to(String(chatId)).emit("call_rejected", {
            from: userId
        });
    });

    // END CALL
    socket.on("end_call", ({ chatId }) => {
        if (!chatId) return;

        socket.to(String(chatId)).emit("call_ended", {
            from: userId
        });
    });

};

export { initCallSocket };
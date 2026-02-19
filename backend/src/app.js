import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { initChatSocket } from "./sockets/chat.sockets.js";
const app = express();
const server = createServer(app);

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
    : ["http://localhost:5173", "http://localhost:5174"];

app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());





import userRouter from "./routes/user.routes.js";
import chatRouter from "./routes/chats.routes.js";
import messageRouter from "./routes/messages.routes.js";
import requestRouter from "./routes/requests.routes.js";

app.use("/api/users", userRouter);
app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);
app.use("/api/requests", requestRouter);


const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
    },
});

initChatSocket(io);

// Global error handler — converts ApiError to JSON response
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    res.status(statusCode).json({
        statusCode,
        data: null,
        message,
        success: false,
        errors: err.errors || [],
    });
});

export { server };

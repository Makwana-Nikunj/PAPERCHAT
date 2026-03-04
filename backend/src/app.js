import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { initChatSocket } from "./sockets/chat.sockets.js";
import performanceMiddleware from "./middleware/performance.middleware.js";
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
app.use(compression());
app.use(performanceMiddleware);





import userRouter from "./routes/user.routes.js";
import chatRouter from "./routes/chats.routes.js";
import messageRouter from "./routes/messages.routes.js";
import requestRouter from "./routes/requests.routes.js";

app.use("/api/users", userRouter);
app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);
app.use("/api/requests", requestRouter);

// Health check endpoint for keep-alive pings
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});


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

// Keep-alive self-ping — prevents cold starts on Render free tier
import { keepAlive } from "./utils/keepAlive.js";
keepAlive();

export { server };

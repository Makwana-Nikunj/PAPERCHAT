import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sql } from "../db/index.js";

const verifyJwt = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            throw new ApiError(401, "Access token expired or invalid");
        }

        const users = await sql`SELECT id, username, email, avatar FROM users WHERE id = ${decodedToken.id}`;

        if (!users || users.length === 0) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = users[0];
        next();
    } catch (error) {
        throw new ApiError(error?.statusCode || 401, error?.message || "Invalid access token");
    }
});

export { verifyJwt };
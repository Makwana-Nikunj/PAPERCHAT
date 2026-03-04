import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sql } from "../db/index.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ============================================
// TOKEN HELPERS
// ============================================

const accessCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 15 * 60 * 60 * 1000 // 15 hours
};

const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );
};

const generateAndSaveTokens = async (userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    await sql`UPDATE users SET refresh_token = ${refreshToken} WHERE id = ${userId}`;

    return { accessToken, refreshToken };
};

// ============================================
// AUTH CONTROLLERS
// ============================================

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body || {};

    if ([username, email, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUsers = await sql`
        SELECT id FROM users 
        WHERE LOWER(username) = ${username.toLowerCase()} 
        OR email = ${email}
    `;

    if (existingUsers.length > 0) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    let avatarUrl = null;
    let avatarPublicId = null;

    if (avatarLocalPath) {
        const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
        avatarUrl = uploadedAvatar?.secure_url || null;
        avatarPublicId = uploadedAvatar?.public_id || null;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await sql`
        INSERT INTO users (username, email, password_hash, avatar, avatar_public_id)
        VALUES (${username.toLowerCase()}, ${email}, ${passwordHash}, ${avatarUrl}, ${avatarPublicId})
        RETURNING id, username, email, avatar, created_at
    `;

    if (!newUser || newUser.length === 0) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    const { accessToken, refreshToken } = await generateAndSaveTokens(newUser[0].id);

    return res
        .status(201)
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json(new ApiResponse(201, { user: newUser[0], accessToken }, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
        throw new ApiError(400, "Email and password are required");
    }

    const users = await sql`
        SELECT id, username, email, password_hash, avatar, created_at
        FROM users WHERE email = ${email}
    `;

    if (users.length === 0) {
        throw new ApiError(401, "Invalid email or password");
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = await generateAndSaveTokens(user.id);
    const { password_hash, ...userWithoutPassword } = user;

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json(new ApiResponse(200, { user: userWithoutPassword, accessToken }, "Login successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await sql`UPDATE users SET refresh_token = NULL WHERE id = ${req.user.id}`;

    return res
        .status(200)
        .clearCookie("accessToken", accessCookieOptions)
        .clearCookie("refreshToken", refreshCookieOptions)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const users = await sql`
        SELECT id, refresh_token FROM users WHERE id = ${decoded.id}
    `;

    if (users.length === 0 || users[0].refresh_token !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAndSaveTokens(users[0].id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});

// ============================================
// PROFILE CONTROLLERS
// ============================================

const getCurrentUser = asyncHandler(async (req, res) => {
    const users = await sql`
        SELECT id, username, email, avatar, created_at, updated_at
        FROM users WHERE id = ${req.user.id}
    `;

    if (users.length === 0) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, users[0], "User fetched successfully"));
});

const changeUsername = asyncHandler(async (req, res) => {
    const { username } = req.body || {};

    if (!username?.trim()) {
        throw new ApiError(400, "Username is required");
    }

    // Check if username is already taken
    const existing = await sql`
        SELECT id FROM users WHERE LOWER(username) = ${username.toLowerCase()} AND id != ${req.user.id}
    `;

    if (existing.length > 0) {
        throw new ApiError(409, "Username is already taken");
    }

    const updated = await sql`
        UPDATE users SET username = ${username.toLowerCase()}
        WHERE id = ${req.user.id}
        RETURNING id, username, email, avatar, created_at, updated_at
    `;

    return res.status(200).json(new ApiResponse(200, updated[0], "Username updated successfully"));
});

const changeAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Get current avatar public_id for deletion
    const currentUser = await sql`
        SELECT avatar_public_id FROM users WHERE id = ${req.user.id}
    `;

    // Upload new avatar
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);

    if (!uploadedAvatar?.secure_url) {
        throw new ApiError(500, "Error uploading avatar");
    }

    // Delete old avatar from cloudinary
    if (currentUser[0]?.avatar_public_id) {
        await deleteFromCloudinary(currentUser[0].avatar_public_id);
    }

    const updated = await sql`
        UPDATE users SET avatar = ${uploadedAvatar.secure_url}, avatar_public_id = ${uploadedAvatar.public_id}
        WHERE id = ${req.user.id}
        RETURNING id, username, email, avatar, created_at, updated_at
    `;

    return res.status(200).json(new ApiResponse(200, updated[0], "Avatar updated successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword?.trim() || !newPassword?.trim()) {
        throw new ApiError(400, "Current password and new password are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "New password must be at least 6 characters");
    }

    const users = await sql`
        SELECT id, password_hash FROM users WHERE id = ${req.user.id}
    `;

    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isValid) {
        throw new ApiError(401, "Current password is incorrect");
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${req.user.id}`;

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const searchUsers = asyncHandler(async (req, res) => {
    const { query } = req.query || {};

    if (!query?.trim()) {
        throw new ApiError(400, "Search query is required");
    }

    const users = await sql`
        SELECT id, username, avatar
        FROM users
        WHERE LOWER(username) LIKE ${'%' + query.toLowerCase() + '%'}
          AND id != ${req.user.id}
        LIMIT 20
    `;

    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeUsername,
    changeAvatar,
    changePassword,
    searchUsers
};
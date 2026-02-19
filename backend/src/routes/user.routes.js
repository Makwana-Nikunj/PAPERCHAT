import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeUsername,
    changeAvatar,
    changePassword,
    searchUsers
} from "../controllers/user.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/me").get(verifyJwt, getCurrentUser);
router.route("/change-username").patch(verifyJwt, changeUsername);
router.route("/change-avatar").patch(
    verifyJwt,
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    changeAvatar
);
router.route("/change-password").patch(verifyJwt, changePassword);
router.route("/search").get(verifyJwt, searchUsers);

export default router;


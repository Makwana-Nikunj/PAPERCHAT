import { Router } from "express";
const router = Router();

import {
    getUserChats,
    deleteChat
} from "../controllers/chats.controllers.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

router.use(verifyJwt);

router.route("/").get(getUserChats);
router.route("/:chatId").delete(deleteChat);



export default router;
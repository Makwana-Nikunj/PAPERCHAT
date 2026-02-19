import { Router } from "express";
const router = Router();

import { getMessagesByChatId } from "../controllers/message.controllers.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

router.use(verifyJwt);

// Only history retrieval via REST — all writes go through Socket.IO
router.route("/:chatId").get(getMessagesByChatId);


export default router;
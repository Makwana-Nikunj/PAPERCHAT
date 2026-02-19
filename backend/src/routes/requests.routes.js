import { Router } from "express";
const router = Router();

import {
    sendRequest,
    getRequests,
    acceptRequest,
    rejectRequest
} from "../controllers/requests.controllers.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

router.use(verifyJwt);

router.route("/").post(sendRequest);
router.route("/").get(getRequests);
router.route("/:requestId").put(acceptRequest);
router.route("/:requestId").delete(rejectRequest);


export default router;
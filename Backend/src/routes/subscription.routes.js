import { Router } from "express"; // 👈 This line MUST be here
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply verifyJWT middleware to all routes in this file
router.use(verifyJWT); 

router
    .route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;
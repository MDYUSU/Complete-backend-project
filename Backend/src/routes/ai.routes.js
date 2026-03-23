import { Router } from "express";
import { generateVideoSummary } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// We protect this so only logged-in users can use your AI credits!
router.route("/summarize").post(verifyJWT, generateVideoSummary);

export default router;
import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    // 🚀 NEW: Import this (make sure it's exported in your controller)
    updateWatchHistoryAndViews 
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

// --- PUBLIC ROUTES ---
router.route("/").get(getAllVideos);
router.route("/:videoId").get(getVideoById);

// --- PRIVATE ROUTES (Requires Login) ---
router.use(verifyJWT); 

// 🚀 NEW: Patch route to trigger View Count + Watch History
router.route("/watch/:videoId").patch(updateWatchHistoryAndViews);

router.route("/").post(
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    publishAVideo
);

router
    .route("/:videoId")
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
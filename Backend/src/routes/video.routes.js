import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    updateWatchHistoryAndViews, 
    getRelatedVideos
} from "../controllers/video.controller.js"
import { verifyJWT, getOptionalUser } from "../middlewares/auth.middleware.js" // 🚀 Added getOptionalUser
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();

// --- PUBLIC / PERSISTENCE ROUTES ---
// We use getOptionalUser so req.user is populated if a user is logged in
router.route("/").get(getOptionalUser, getAllVideos);
router.route("/:videoId").get(getOptionalUser, getVideoById); 

// --- PRIVATE ROUTES ---
router.use(verifyJWT); 

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
router.route("/related/:videoId").get(getRelatedVideos);

export default router;
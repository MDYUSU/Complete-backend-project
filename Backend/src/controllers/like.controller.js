import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper function to handle toggling likes for any entity
const toggleLike = async (userId, filter, errorMessage) => {
    const existingLike = await Like.findOne({ ...filter, likedBy: userId });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return { isLiked: false };
    }

    await Like.create({ ...filter, likedBy: userId });
    return { isLiked: true };
};

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

    const result = await toggleLike(req.user?._id, { video: videoId });

    return res
        .status(200)
        .json(new ApiResponse(200, result, result.isLiked ? "Video liked" : "Video unliked"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid commentId");

    const result = await toggleLike(req.user?._id, { comment: commentId });

    return res
        .status(200)
        .json(new ApiResponse(200, result, result.isLiked ? "Comment liked" : "Comment unliked"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweetId");

    const result = await toggleLike(req.user?._id, { tweet: tweetId });

    return res
        .status(200)
        .json(new ApiResponse(200, result, result.isLiked ? "Tweet liked" : "Tweet unliked"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                video: { $exists: true }, // Only get likes that are on videos
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                            pipeline: [
                                { $project: { fullName: 1, username: 1, avatar: 1 } }
                            ]
                        }
                    },
                    { $unwind: "$ownerDetails" }
                ]
            }
        },
        { $unwind: "$videoDetails" },
        {
            $project: {
                _id: 0, // We don't need the Like document ID
                videoDetails: 1
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,    
    getLikedVideos
};  
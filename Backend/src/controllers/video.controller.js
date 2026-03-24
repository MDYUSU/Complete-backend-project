import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// 1. Get all videos (Search, Sort, Pagination)
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pipeline = [];

    // Filter by published status only
    pipeline.push({
        $match: {
            isPublished: true
        }
    });

    // Filter by userId (if looking for a specific channel's videos)
    if (userId && userId !== "undefined" && userId.trim() !== "") {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId format");
        }
        
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    // Filter by search query (Title or Description)
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                ],
            },
        });
    }

    // Fetch owner details
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [{ $project: { username: 1, avatar: 1, fullName: 1 } }],
            },
        },
        { $unwind: "$owner" }
    );

    // Sort logic
    const sortField = sortBy || "createdAt";
    const sortOrder = sortType === "asc" ? 1 : -1;
    pipeline.push({ $sort: { [sortField]: sortOrder } });

    const videoAggregate = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const videos = await Video.aggregatePaginate(videoAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

// 2. Publish a Video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) throw new ApiError(400, "Video file is required");
    if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) throw new ApiError(400, "Video upload failed");

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user._id,
        isPublished: true,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
});

// 3. Get Video by ID (Updated with Like/Dislike persistence)
// ... (Your other imports remain the same)
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Identify the user if they are logged in (via getOptionalUser middleware)
    const userId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            // Join with owner details
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            // Join with likes collection
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: {
                    $size: {
                        $filter: {
                            input: "$likes",
                            as: "l",
                            cond: { $eq: ["$$l.isDislike", false] }
                        }
                    }
                },
                isLiked: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: [userId, null] },
                                { $in: [userId, "$likes.likedBy"] },
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: "$likes",
                                                    as: "l",
                                                    cond: { 
                                                        $and: [
                                                            { $eq: ["$$l.likedBy", userId] },
                                                            { $eq: ["$$l.isDislike", false] }
                                                        ]
                                                    }
                                                }
                                            }
                                        }, 0
                                    ]
                                }
                            ]
                        },
                        then: true,
                        else: false
                    }
                },
                isDisliked: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: [userId, null] },
                                { $in: [userId, "$likes.likedBy"] },
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: "$likes",
                                                    as: "l",
                                                    cond: { 
                                                        $and: [
                                                            { $eq: ["$$l.likedBy", userId] },
                                                            { $eq: ["$$l.isDislike", true] }
                                                        ]
                                                    }
                                                }
                                            }
                                        }, 0
                                    ]
                                }
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                likes: 0 // Clean up the raw array
            }
        }
    ]);

    if (!video?.length) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

// ... (Rest of your functions: updateVideo, deleteVideo, etc., remain the same)
// 4. Update Video Details
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Forbidden");
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (thumbnail?.url) updateData.thumbnail = thumbnail.url;
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateData },
        { new: true }
    );

    return res.status(200).json(new ApiResponse(200, updatedVideo, "Updated"));
});

// 5. Delete Video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    // Note: Cloudinary deletion should happen here before DB deletion
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(new ApiResponse(200, {}, "Deleted"));
});

// 6. Toggle Publish Status
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, video, "Toggled"));
});

// 7. 🚀 Watch Activity (Views + History)
const updateWatchHistoryAndViews = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },
        { new: true }
    );

    if (!video) throw new ApiError(404, "Video not found");

    // Add to history (remove old instance first to bring to top)
    await User.findByIdAndUpdate(req.user?._id, {
        $pull: { watchHistory: videoId }
    });
    
    await User.findByIdAndUpdate(req.user?._id, {
        $push: { watchHistory: videoId }
    });

    return res.status(200).json(new ApiResponse(200, { views: video.views }, "Activity updated"));
});


const getSearchSuggestions = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(200).json(new ApiResponse(200, [], ""));

    const suggestions = await Video.find({
        title: { $regex: query, $options: "i" },
        isPublished: true
    })
    .select("title")
    .limit(5);

    res.status(200).json(new ApiResponse(200, suggestions, "Suggestions fetched"));
});

const getRelatedVideos = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const currentVideo = await Video.findById(videoId);

    if (!currentVideo) throw new ApiError(404, "Video not found");

    // Try to find videos from the same owner or with similar title
    let related = await Video.aggregate([
        {
            $match: {
                _id: { $ne: currentVideo._id },
                isPublished: true,
                $or: [
                    { owner: currentVideo.owner },
                    { title: { $regex: currentVideo.title.split(" ")[0], $options: "i" } }
                ]
            }
        },
        { $limit: 10 },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [{ $project: { fullName: 1, avatar: 1 } }]
            }
        },
        { $unwind: "$owner" }
    ]);

    // 🚀 FALLBACK: If still empty, just grab any other 10 videos
    if (related.length === 0) {
        related = await Video.aggregate([
            { $match: { _id: { $ne: currentVideo._id }, isPublished: true } },
            { $sample: { size: 10 } },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [{ $project: { fullName: 1, avatar: 1 } }]
                }
            },
            { $unwind: "$owner" }
        ]);
    }

    return res.status(200).json(new ApiResponse(200, related, "Related videos fetched"));
});

const toggleDownloadHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");

    // Add video to user's downloadedVideos array (prevents duplicates)
    await User.findByIdAndUpdate(req.user?._id, {
        $addToSet: { downloadedVideos: videoId }
    });

    return res.status(200).json(new ApiResponse(200, {}, "Video added to downloads"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateWatchHistoryAndViews,
    getRelatedVideos,
    toggleDownloadHistory // 🚀 Fixed Export
};
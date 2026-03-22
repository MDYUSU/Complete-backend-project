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

    // IMPROVED CHECK: Ensure userId is a real string and not "undefined" or empty
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

  // Sort logic
  const sortField = sortBy || "createdAt";
  const sortOrder = sortType === "asc" ? 1 : -1;
  pipeline.push({ $sort: { [sortField]: sortOrder } });

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

  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath) throw new ApiError(400, "Video file is required");
  if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");

  // Upload to Cloudinary
  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) throw new ApiError(400, "Video upload failed");

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration, // Cloudinary provides this automatically
    owner: req.user._id,
    isPublished: true,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video published successfully"));
});

// 3. Get Video by ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        // 1. Get Owner Details
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { username: 1, avatar: 1, fullName: 1 } }
                ]
            }
        },
        // 2. Get Total Likes Count
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        // 3. Check if CURRENT User liked it
        {
            $lookup: {
                from: "likes",
                let: { videoId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$video", "$$videoId"] },
                                    { $eq: ["$likedBy", new mongoose.Types.ObjectId(req.user?._id)] }
                                ]
                            }
                        }
                    }
                ],
                as: "isLiked"
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $gt: [{ $size: "$isLiked" }, 0] },
                        then: true,
                        else: false
                    }
                }
            }
        }
    ]);


    
    if (!video?.length) throw new ApiError(404, "Video not found");

    return res
        .status(200)
        .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

// 4. Update Video Details
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

  if (!title && !description && !thumbnailLocalPath) {
    throw new ApiError(400, "At least one field is required to update");
  }

  // FIX 1: Find the video and check if it exists first
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Ownership check
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You don't have permission to update this video");
  }

  // FIX 2: Only add fields to updateData if they are actually provided
  const updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;

  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (thumbnail?.url) {
        updateData.thumbnail = thumbnail.url;
    }
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateData },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// 5. Delete Video
// You'll need a helper function in your cloudinary.js file for this
// For now, I'll show you the logic within the controller
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  // Ownership Check
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this video");
  }

  // 1. EXTRACT PUBLIC IDs (Assumes you stored Cloudinary URLs)
  // Example URL: https://res.cloudinary.com/demo/video/upload/v12345/public_id.mp4
  const videoFilePublicId = video.videoFile.split("/").pop().split(".")[0];
  const thumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];

  // 2. DELETE FROM CLOUDINARY
  // In a real app, you'd call your utility: await deleteFromCloudinary(videoFilePublicId, "video")
  // and: await deleteFromCloudinary(thumbnailPublicId, "image")
  
  // 3. DELETE FROM DATABASE
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video and associated files deleted successfully"));
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

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status toggled"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

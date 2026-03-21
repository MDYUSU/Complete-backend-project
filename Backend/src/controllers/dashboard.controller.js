import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    // 1. Get total subscribers (Single query is faster for this)
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    })

    // 2. Aggregate to get total views, total videos, and total likes
    const videoStats = await Video.aggregate([
        {
            // Filter videos belonging to this user
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            // Join with the likes collection for each video
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            // Add a field that counts the likes in the array
            $addFields: {
                likesCount: {
                    $size: "$likes"
                }
            }
        },
        {
            // Sum everything up into one final object
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalVideos: { $sum: 1 },
                totalLikes: { $sum: "$likesCount" }
            }
        }
    ])

    const stats = {
        totalSubscribers,
        totalViews: videoStats[0]?.totalViews || 0,
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalLikes: videoStats[0]?.totalLikes || 0
    }

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    // Simple find query to get all videos for the dashboard list
    const videos = await Video.find({
        owner: userId
    }).sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
}
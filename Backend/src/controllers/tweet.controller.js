import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required to post a tweet")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if (!tweet) {
        throw new ApiError(500, "Failed to create tweet")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID")
    }

    // Using aggregation to get tweets along with user info if needed
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        {
            $sort: {
                createdAt: -1 // Newest first
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required for update")
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // Authorization check
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to edit this tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content } },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // Authorization check
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
        .status(200)
        .json(new ApiResponse(200, { deletedId: tweetId }, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
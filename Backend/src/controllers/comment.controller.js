import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    // Creating the aggregation pipeline
    const aggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
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
                createdAt: -1 // Show newest comments first
            }
        }
    ])

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    // Using aggregatePaginate for efficient loading
    const comments = await Comment.aggregatePaginate(aggregate, options)

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if (!comment) {
        throw new ApiError(500, "Failed to add comment")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required to update comment")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // Security check: Is this the user's own comment?
    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to edit this comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content } },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // Security check: Only the owner can delete
    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
        .status(200)
        .json(new ApiResponse(200, { deletedId: commentId }, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
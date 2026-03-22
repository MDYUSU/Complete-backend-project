import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// 1. Get all comments for a specific video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 50, sortBy = "createdAt", sortType = -1 } = req.query;

    const aggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            }
        },
        // 1. Join with Users to get owner details
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { username: 1, avatar: 1 } }
                ]
            }
        },
        // 2. Join with Likes to get the total LIKE count
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        // 3. Join with Likes again to see if the CURRENT user liked it
        {
            $lookup: {
                from: "likes",
                let: { commentId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$comment", "$$commentId"] },
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
                likesCount: { $size: "$likes" }, // Count total likes
                isLiked: {
                    $cond: {
                        if: { $gt: [{ $size: "$isLiked" }, 0] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: {
                isPinned: -1,
                [sortBy]: Number(sortType)
            }
        }
    ]);

    const result = await Comment.aggregatePaginate(aggregate, { page, limit });
    return res.status(200).json(new ApiResponse(200, result, "Success"));
});

// 2. Add a new comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content, parentComment } = req.body; // 👈 1. Get parentComment from body

    if (!content) throw new ApiError(400, "Content is required");

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id,
        parentComment: parentComment || null // 👈 2. Save the ID if it exists
    });

    const populatedComment = await Comment.findById(comment._id).populate("owner", "username avatar");

    return res.status(201).json(new ApiResponse(201, populatedComment, "Comment added"));
});
// 3. Update a comment (owner only)
// 1. Update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) throw new ApiError(400, "Content is required");

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    // Check ownership
    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not allowed to edit this comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content } },
        { new: true }
    );

    return res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated"));
});
// 4. Delete a comment (owner only)
// 2. Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    // Check ownership
    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this comment");
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(new ApiResponse(200, { commentId }, "Comment deleted"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
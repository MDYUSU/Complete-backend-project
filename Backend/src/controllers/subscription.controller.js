import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    // Check if the subscription already exists
    const subscriptionInstance = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    });

    if (subscriptionInstance) {
        // Unsubscribe
        await Subscription.findByIdAndDelete(subscriptionInstance._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"));
    } else {
        // Subscribe
        await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId,
        });
        return res
            .status(200)
            .json(new ApiResponse(200, { subscribed: true }, "Subscribed successfully"));
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatar: 1 } }
                ]
            }
        },
        { $unwind: "$subscriberDetails" },
        {
            $project: {
                _id: 1,
                subscriber: "$subscriberDetails"
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params; // This is the user we are looking up

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber ID");
    }

    const subscribedTo = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails",
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatar: 1 } }
                ]
            }
        },
        { $unwind: "$channelDetails" },
        {
            $project: {
                _id: 1,
                channel: "$channelDetails"
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedTo, "Subscribed channels fetched successfully"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
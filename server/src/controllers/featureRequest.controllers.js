import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { FeatureRequest } from "../models/featureRequest.models.js";
import { sanitizeHTML } from "../utils/validation.js";
import mongoose from "mongoose";

const createFeatureRequest = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required.");
    }

    const featureRequest = await FeatureRequest.create({
        title: sanitizeHTML(title),
        description: sanitizeHTML(description),
        author: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, featureRequest, "Feature request submitted successfully."));
});

const getAllFeatureRequests = asyncHandler(async (req, res) => {
    const { sortBy = 'popular' } = req.query;
    const userId = req.user._id;

    let sortStage;
    if (sortBy === 'recent') {
        sortStage = { $sort: { createdAt: -1 } };
    } else { // Default to 'popular'
        sortStage = {
            $addFields: { upvoteCount: { $size: "$upvotes" } },
            $sort: { upvoteCount: -1, createdAt: -1 }
        };
    }
    
    const requests = await FeatureRequest.aggregate([
        sortStage,
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "authorInfo"
            }
        },
        { $unwind: "$authorInfo" },
        {
            $project: {
                title: 1,
                description: 1,
                status: 1,
                createdAt: 1,
                upvoteCount: { $size: "$upvotes" },
                author: {
                    _id: "$authorInfo._id",
                    fullName: "$authorInfo.fullName",
                    username: "$authorInfo.username"
                },
                // Check if the current user has upvoted this request
                hasUpvoted: { $in: [userId, "$upvotes"] }
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, requests, "Feature requests retrieved successfully."));
});

const toggleUpvote = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
        throw new ApiError(400, "Invalid request ID.");
    }

    const request = await FeatureRequest.findById(requestId);
    if (!request) {
        throw new ApiError(404, "Feature request not found.");
    }

    const upvoteIndex = request.upvotes.indexOf(userId);
    if (upvoteIndex > -1) {
        // User has already upvoted, remove their vote
        request.upvotes.splice(upvoteIndex, 1);
    } else {
        // User has not upvoted, add their vote
        request.upvotes.push(userId);
    }

    await request.save();

    return res.status(200).json(new ApiResponse(200, { upvotes: request.upvotes.length }, "Vote toggled successfully."));
});

export {
    createFeatureRequest,
    getAllFeatureRequests,
    toggleUpvote,
};
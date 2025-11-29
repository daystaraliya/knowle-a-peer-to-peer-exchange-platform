import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Forum } from "../models/forum.models.js";
import { Post } from "../models/post.models.js";
import { sanitizeHTML } from "../utils/validation.js";
import mongoose from "mongoose";

const getAllForums = asyncHandler(async (req, res) => {
    // Aggregation to get post count and member count for each forum
    const forums = await Forum.aggregate([
        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "forum",
                as: "posts"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "creator",
                foreignField: "_id",
                as: "creatorInfo"
            }
        },
        {
            $unwind: "$creatorInfo"
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                creator: { fullName: "$creatorInfo.fullName" },
                postCount: { $size: "$posts" },
                memberCount: { $size: "$members" }
            }
        },
        { $sort: { createdAt: -1 } }
    ]);
    return res.status(200).json(new ApiResponse(200, forums, "Forums retrieved successfully."));
});

const createForum = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required.");
    }

    const sanitizedName = sanitizeHTML(name);
    const sanitizedDescription = sanitizeHTML(description);

    const existingForum = await Forum.findOne({ name: sanitizedName });
    if (existingForum) {
        throw new ApiError(409, "A forum with this name already exists.");
    }

    const forum = await Forum.create({
        name: sanitizedName,
        description: sanitizedDescription,
        creator: req.user._id,
        members: [req.user._id]
    });

    return res.status(201).json(new ApiResponse(201, forum, "Forum created successfully."));
});

const getForumDetails = asyncHandler(async (req, res) => {
    const { forumId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(forumId)) {
        throw new ApiError(400, "Invalid forum ID.");
    }
    const forum = await Forum.findById(forumId).populate('creator', 'fullName');
    if (!forum) {
        throw new ApiError(404, "Forum not found.");
    }
    return res.status(200).json(new ApiResponse(200, forum, "Forum details retrieved successfully."));
});

export { getAllForums, createForum, getForumDetails };
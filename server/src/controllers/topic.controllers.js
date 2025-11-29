import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Topic } from "../models/topic.models.js";

const createTopic = asyncHandler(async (req, res) => {
    const { name, category, description } = req.body;

    if (!name || !category) {
        throw new ApiError(400, "Name and category are required");
    }

    const formattedName = name.trim();
    const existingTopic = await Topic.findOne({ name: { $regex: new RegExp(`^${formattedName}$`, 'i') } });
    
    if (existingTopic) {
        // Return existing topic instead of an error to allow for seamless additions
        return res.status(200).json(new ApiResponse(200, existingTopic, "Topic already exists."));
    }

    const topic = await Topic.create({ name: formattedName, category, description });

    return res.status(201).json(new ApiResponse(201, topic, "Topic created successfully"));
});

const getAllTopics = asyncHandler(async (req, res) => {
    const { search = '' } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};

    const topics = await Topic.find(query).sort({ name: 1 });

    return res.status(200).json(new ApiResponse(200, topics, "Topics retrieved successfully"));
});

export { createTopic, getAllTopics };

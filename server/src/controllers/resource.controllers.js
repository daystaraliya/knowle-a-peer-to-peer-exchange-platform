import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Resource } from "../models/resource.models.js";
import { sanitizeHTML } from "../utils/validation.js";
import mongoose from "mongoose";

const createResource = asyncHandler(async (req, res) => {
    const { title, type, content, url, topic } = req.body;
    const author = req.user._id;

    if (!title || !type || !topic) {
        throw new ApiError(400, "Title, type, and topic are required.");
    }
    if (type === 'article' && !content) {
        throw new ApiError(400, "Content is required for an article.");
    }
    if (type === 'link') {
        if (!url) throw new ApiError(400, "URL is required for a link.");
        try {
            new URL(url); // Validate URL format
        } catch (_) {
            throw new ApiError(400, "Please provide a valid URL.");
        }
    }


    const resource = await Resource.create({
        title: sanitizeHTML(title),
        type,
        content: type === 'article' ? sanitizeHTML(content) : undefined,
        url: type === 'link' ? url : undefined,
        topic,
        author
    });

    return res.status(201).json(new ApiResponse(201, resource, "Resource created successfully."));
});

const getAllResources = asyncHandler(async (req, res) => {
    const { topic } = req.query;
    const query = {};
    if (topic) {
        if (!mongoose.Types.ObjectId.isValid(topic)) {
            throw new ApiError(400, "Invalid topic ID for filtering.");
        }
        query.topic = topic;
    }

    const resources = await Resource.find(query)
        .populate('author', 'fullName avatar username')
        .populate('topic', 'name')
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, resources, "Resources retrieved successfully."));
});

const getResourceById = asyncHandler(async (req, res) => {
    const { resourceId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        throw new ApiError(400, "Invalid resource ID.");
    }

    const resource = await Resource.findById(resourceId)
        .populate('author', 'fullName avatar username')
        .populate('topic', 'name');

    if (!resource) {
        throw new ApiError(404, "Resource not found.");
    }

    return res.status(200).json(new ApiResponse(200, resource, "Resource details retrieved successfully."));
});

const updateResource = asyncHandler(async (req, res) => {
    const { resourceId } = req.params;
    const { title, content, url, topic } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        throw new ApiError(400, "Invalid resource ID.");
    }
    
    const resource = await Resource.findById(resourceId);
    if (!resource) throw new ApiError(404, "Resource not found.");

    if (resource.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this resource.");
    }

    if (title) resource.title = sanitizeHTML(title);
    if (topic) resource.topic = topic;
    if (resource.type === 'article' && content) resource.content = sanitizeHTML(content);
    if (resource.type === 'link' && url) resource.url = url;

    await resource.save();

    return res.status(200).json(new ApiResponse(200, resource, "Resource updated successfully."));
});

const deleteResource = asyncHandler(async (req, res) => {
    const { resourceId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        throw new ApiError(400, "Invalid resource ID.");
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) throw new ApiError(404, "Resource not found.");

    if (resource.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this resource.");
    }

    await Resource.findByIdAndDelete(resourceId);

    return res.status(200).json(new ApiResponse(200, {}, "Resource deleted successfully."));
});

const toggleUpvoteResource = asyncHandler(async (req, res) => {
    const { resourceId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        throw new ApiError(400, "Invalid resource ID.");
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) throw new ApiError(404, "Resource not found.");

    const upvoteIndex = resource.upvotes.indexOf(userId);

    if (upvoteIndex > -1) {
        resource.upvotes.splice(upvoteIndex, 1);
    } else {
        resource.upvotes.push(userId);
    }

    await resource.save();

    return res.status(200).json(new ApiResponse(200, { upvotesCount: resource.upvotes.length }, "Upvote toggled successfully."));
});

export {
    createResource,
    getAllResources,
    getResourceById,
    updateResource,
    deleteResource,
    toggleUpvoteResource,
};
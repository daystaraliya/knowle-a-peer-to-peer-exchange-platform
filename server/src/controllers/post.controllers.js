import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/post.models.js";
import { Forum } from "../models/forum.models.js";
import { sanitizeHTML } from "../utils/validation.js";
import mongoose from "mongoose";

const getPostsByForum = asyncHandler(async (req, res) => {
    const { forumId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(forumId)) {
        throw new ApiError(400, "Invalid forum ID.");
    }
    const posts = await Post.find({ forum: forumId, parentPost: null }) // Only top-level posts
        .populate('author', 'fullName avatar username')
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, posts, "Posts retrieved successfully."));
});

const getPostWithReplies = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid post ID.");
    }
    const post = await Post.findById(postId).populate('author', 'fullName avatar username');
    if (!post) {
        throw new ApiError(404, "Post not found.");
    }

    const replies = await Post.find({ parentPost: postId })
        .populate('author', 'fullName avatar username')
        .sort({ createdAt: 'asc' });

    const response = { ...post.toObject(), replies };

    return res.status(200).json(new ApiResponse(200, response, "Post and replies retrieved successfully."));
});


const createPost = asyncHandler(async (req, res) => {
    const { forumId } = req.params;
    const { title, content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required.");
    }
    if (!mongoose.Types.ObjectId.isValid(forumId)) {
        throw new ApiError(400, "Invalid forum ID.");
    }
    const forum = await Forum.findById(forumId);
    if (!forum) {
        throw new ApiError(404, "Forum not found.");
    }

    const post = await Post.create({
        forum: forumId,
        author: req.user._id,
        title: sanitizeHTML(title),
        content: sanitizeHTML(content)
    });
    
    const populatedPost = await Post.findById(post._id).populate('author', 'fullName avatar username');
    
    return res.status(201).json(new ApiResponse(201, populatedPost, "Post created successfully."));
});

const createReply = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required for a reply.");
    }
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid parent post ID.");
    }

    const parentPost = await Post.findById(postId);
    if (!parentPost) {
        throw new ApiError(404, "Parent post not found.");
    }

    const reply = await Post.create({
        forum: parentPost.forum,
        author: req.user._id,
        parentPost: postId,
        content: sanitizeHTML(content)
    });

    parentPost.replyCount += 1;
    await parentPost.save();

    const populatedReply = await Post.findById(reply._id).populate('author', 'fullName avatar username');

    return res.status(201).json(new ApiResponse(201, populatedReply, "Reply created successfully."));
});

const toggleUpvote = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid post ID.");
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found.");
    }

    const upvoteIndex = post.upvotes.indexOf(userId);

    if (upvoteIndex > -1) {
        // User has already upvoted, so remove it
        post.upvotes.splice(upvoteIndex, 1);
    } else {
        // User has not upvoted, so add it
        post.upvotes.push(userId);
    }

    await post.save();
    
    return res.status(200).json(new ApiResponse(200, { upvotes: post.upvotes.length }, "Upvote toggled successfully."));
});


export { getPostsByForum, getPostWithReplies, createPost, createReply, toggleUpvote };
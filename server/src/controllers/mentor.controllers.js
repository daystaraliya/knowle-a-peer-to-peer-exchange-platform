import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { MentorshipOffering } from "../models/mentorshipOffering.models.js";
import { PremiumContent } from "../models/premiumContent.models.js";

const getAllMentors = asyncHandler(async (req, res) => {
    const mentors = await User.find({ role: 'mentor' }).select('fullName username avatar bio');
    return res.status(200).json(new ApiResponse(200, mentors, "Mentors retrieved successfully."));
});

const getMentorOfferings = asyncHandler(async (req, res) => {
    const { mentorId } = req.params;
    const offerings = await MentorshipOffering.find({ mentor: mentorId });
    return res.status(200).json(new ApiResponse(200, offerings, "Mentor offerings retrieved successfully."));
});

const getMentorPremiumContent = asyncHandler(async (req, res) => {
    const { mentorId } = req.params;
    // Only return titles for public view
    const content = await PremiumContent.find({ mentor: mentorId }).select('title');
    return res.status(200).json(new ApiResponse(200, content, "Mentor premium content list retrieved successfully."));
});

const getAllPremiumContent = asyncHandler(async (req, res) => {
    if (req.user.premium?.subscriptionStatus !== 'active') {
        throw new ApiError(403, "You must be a premium subscriber to view this content.");
    }
    const content = await PremiumContent.find().populate('mentor', 'fullName username');
    return res.status(200).json(new ApiResponse(200, content, "Premium content retrieved successfully."));
});


// Mentor-only actions
const createMentorshipOffering = asyncHandler(async (req, res) => {
    if (req.user.role !== 'mentor') throw new ApiError(403, "Only mentors can create offerings.");
    
    const { title, description, price, duration } = req.body;
    if (!title || !description || !price || !duration) {
        throw new ApiError(400, "All fields are required.");
    }

    const offering = await MentorshipOffering.create({
        mentor: req.user._id,
        title,
        description,
        price: Math.round(price * 100), // Store in cents
        duration,
    });

    return res.status(201).json(new ApiResponse(201, offering, "Mentorship offering created successfully."));
});

const createPremiumContent = asyncHandler(async (req, res) => {
    if (req.user.role !== 'mentor') throw new ApiError(403, "Only mentors can create premium content.");

    const { title, content, type } = req.body;
    if (!title || !content) {
        throw new ApiError(400, "Title and content are required.");
    }

    const premiumContent = await PremiumContent.create({
        mentor: req.user._id,
        title,
        content,
        type
    });
    
    return res.status(201).json(new ApiResponse(201, premiumContent, "Premium content created successfully."));
});

export {
    getAllMentors,
    getMentorOfferings,
    getMentorPremiumContent,
    getAllPremiumContent,
    createMentorshipOffering,
    createPremiumContent,
};
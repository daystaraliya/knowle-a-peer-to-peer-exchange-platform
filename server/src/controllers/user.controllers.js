import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { Exchange } from "../models/exchange.models.js";
import { SkillProficiency } from "../models/skillProficiency.models.js";
import { VerifiedSkill } from "../models/verifiedSkill.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { mailSender } from "../utils/mailSender.js";
import { isValidEmail, isValidPassword, sanitizeHTML } from "../utils/validation.js";
import crypto from "crypto";
import { triggerReviewAnalysis } from "../services/reviewAnalysis.service.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
    console.log(`fullname: ${fullName} email ${email} username ${username} password: ${password}`)

    if ([fullName, email, username, password].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    if (!isValidEmail(email)) {
        throw new ApiError(400, "Please provide a valid email address.");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new ApiError(400, "Username can only contain letters, numbers, and underscores.");
    }

    if (!isValidPassword(password)) {
        throw new ApiError(400, "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
    }

    const lowercasedUsername = username.toLowerCase();
    const lowercasedEmail = email.toLowerCase();

    const existedUser = await User.findOne({
        $or: [{ email: lowercasedEmail }, { username: lowercasedUsername }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with this email or username already exists.");
    }

    const user = await User.create({
        fullName: sanitizeHTML(fullName),
        email: lowercasedEmail,
        password,
        username: sanitizeHTML(lowercasedUsername)
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new ApiError(404, "Invalid user credentials");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id)
        .populate('topicsToTeach', '_id name')
        .populate('topicsToLearn', '_id name')
        .populate('achievements')
        .select("-password -refreshToken")
        .lean();

    const [proficiencies, verifiedSkills] = await Promise.all([
        SkillProficiency.find({ user: user._id }).populate('topic', '_id name'),
        VerifiedSkill.find({ user: user._id }).select('topic')
    ]);

    loggedInUser.proficiencies = proficiencies;
    loggedInUser.verifiedSkills = verifiedSkills;


    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser
        }, "User logged In successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('topicsToTeach', '_id name')
        .populate('topicsToLearn', '_id name')
        .populate('achievements')
        .select("-password -refreshToken")
        .lean();

    const [proficiencies, verifiedSkills] = await Promise.all([
        SkillProficiency.find({ user: req.user._id }).populate('topic', '_id name'),
        VerifiedSkill.find({ user: req.user._id }).select('topic')
    ]);

    user.proficiencies = proficiencies;
    user.verifiedSkills = verifiedSkills;

    return res.status(200).json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, bio, preferredLanguage, languagesSpoken } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = sanitizeHTML(fullName);
    if (bio) updateData.bio = sanitizeHTML(bio);
    if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;
    if (languagesSpoken && Array.isArray(languagesSpoken)) {
        updateData.languagesSpoken = languagesSpoken
            .map(lang => (typeof lang === 'string' ? sanitizeHTML(lang.trim()) : ''))
            .filter(lang => lang);
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No fields provided for update.");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updateData },
        { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar?.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.secure_url
            }
        },
        { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

// Export all functions
export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar
};

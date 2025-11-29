import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";

const getUserAchievements = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID.");
    }

    const user = await User.findById(userId)
        .populate('achievements')
        .select('achievements');

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    return res.status(200).json(new ApiResponse(200, user.achievements, "User achievements retrieved successfully."));
});

export { getUserAchievements };
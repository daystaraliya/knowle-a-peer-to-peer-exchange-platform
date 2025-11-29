import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.models.js";

const getUserNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(20); // Limit to last 20 notifications

    return res.status(200).json(new ApiResponse(200, notifications, "Notifications retrieved successfully."));
});

const markNotificationsAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    await Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });

    return res.status(200).json(new ApiResponse(200, {}, "Notifications marked as read."));
});

export { getUserNotifications, markNotificationsAsRead };
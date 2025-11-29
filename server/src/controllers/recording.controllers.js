import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Recording } from "../models/recording.models.js";
import { Exchange } from "../models/exchange.models.js";
import mongoose from "mongoose";

const getRecordingDetails = asyncHandler(async (req, res) => {
    const { recordingId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(recordingId)) {
        throw new ApiError(400, "Invalid recording ID.");
    }

    const recording = await Recording.findById(recordingId);
    if (!recording) {
        throw new ApiError(404, "Recording not found.");
    }

    const exchange = await Exchange.findById(recording.exchange);
    if (!exchange) {
        throw new ApiError(404, "Associated exchange not found.");
    }

    // Security check: ensure user is part of the exchange
    if (!exchange.initiator.equals(userId) && !exchange.receiver.equals(userId)) {
        throw new ApiError(403, "You are not authorized to view this recording.");
    }

    return res.status(200).json(new ApiResponse(200, recording, "Recording details retrieved successfully."));
});

export { getRecordingDetails };

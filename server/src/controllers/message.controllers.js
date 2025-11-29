import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../models/message.models.js";
import { Exchange } from "../models/exchange.models.js";
import mongoose from "mongoose";

const getMessagesForExchange = asyncHandler(async (req, res) => {
    const { exchangeId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(exchangeId)) {
        throw new ApiError(400, "Invalid exchange ID.");
    }

    const exchange = await Exchange.findById(exchangeId);
    if (!exchange) {
        throw new ApiError(404, "Exchange not found.");
    }

    // Security check: ensure the user is part of the exchange
    if (!exchange.initiator.equals(userId) && !exchange.receiver.equals(userId)) {
        throw new ApiError(403, "You are not authorized to view these messages.");
    }

    const messages = await Message.find({ exchange: exchangeId })
        .populate('sender', 'fullName avatar _id')
        .sort({ createdAt: 'asc' });

    return res.status(200).json(new ApiResponse(200, messages, "Message history retrieved successfully."));
});

export { getMessagesForExchange };
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Exchange } from "../models/exchange.models.js";
import { User } from "../models/user.models.js";
import { Topic } from "../models/topic.models.js";
import { SkillNode } from "../models/skillNode.models.js";
import { Notification } from "../models/notification.models.js";
import { Recording } from "../models/recording.models.js"; // New Import
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // New Import
import { processTranscription } from "../services/transcription.service.js"; // New Import
import mongoose from "mongoose";
import { getAiPoweredMatches } from "../utils/gemini.js";
import { checkAchievementsOnExchangeComplete } from "../services/achievement.service.js";
import { checkAndAwardVerifiedSkill } from "../services/verification.service.js";
import { triggerReviewAnalysis } from "../services/reviewAnalysis.service.js";

const findMatches = asyncHandler(async (req, res) => {
    const { language } = req.query;
    const currentUser = req.user;

    if (currentUser.topicsToTeach.length === 0 || currentUser.topicsToLearn.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "Please add topics you can teach and want to learn to find matches."));
    }
    
    const matchQuery = {
        _id: { $ne: currentUser._id }, // Exclude current user
        topicsToTeach: { $in: currentUser.topicsToLearn }, // They can teach what I want to learn
        topicsToLearn: { $in: currentUser.topicsToTeach } // They want to learn what I can teach
    };

    if (language) {
        matchQuery.languagesSpoken = language;
    }

    const potentialMatches = await User.find(matchQuery)
        .populate('topicsToTeach', '_id name')
        .populate('topicsToLearn', '_id name')
        .select('fullName username avatar bio topicsToTeach topicsToLearn languagesSpoken')
        .lean();

    if (potentialMatches.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No direct matches found with the current filters."));
    }

    try {
        const aiRankedMatches = await getAiPoweredMatches(currentUser, potentialMatches);
        
        const aiDataMap = new Map(aiRankedMatches.map(m => [m.id, m]));

        const finalMatches = potentialMatches
            .filter(p => aiDataMap.has(p._id.toString()))
            .map(p => ({
                ...p,
                matchReason: aiDataMap.get(p._id.toString()).reason
            }));

        finalMatches.sort((a, b) => {
            const indexA = aiRankedMatches.findIndex(m => m.id === a._id.toString());
            const indexB = aiRankedMatches.findIndex(m => m.id === b._id.toString());
            return indexA - indexB;
        });

        return res.status(200).json(new ApiResponse(200, finalMatches, "AI-powered matches retrieved successfully"));
    } catch (error) {
        console.error("Gemini API error, falling back to basic matching:", error);
        return res.status(200).json(new ApiResponse(200, potentialMatches, "Matches retrieved successfully (fallback)"));
    }
});

const createExchange = asyncHandler(async (req, res) => {
    const { receiverId, topicToLearnId, topicToTeachId } = req.body;
    const initiatorId = req.user._id;

    if (!receiverId || !topicToLearnId || !topicToTeachId) {
        throw new ApiError(400, "Receiver and topics are required.");
    }
    
    if (!mongoose.Types.ObjectId.isValid(receiverId) || !mongoose.Types.ObjectId.isValid(topicToLearnId) || !mongoose.Types.ObjectId.isValid(topicToTeachId)) {
        throw new ApiError(400, "Invalid ID provided for receiver or topics.");
    }


    if (initiatorId.toString() === receiverId) {
        throw new ApiError(400, "You cannot create an exchange with yourself.");
    }

    const existingExchange = await Exchange.findOne({
        $or: [
            { initiator: initiatorId, receiver: receiverId },
            { initiator: receiverId, receiver: initiatorId }
        ],
        status: { $in: ['pending', 'accepted'] }
    });

    if (existingExchange) {
        throw new ApiError(409, "An active or pending exchange request with this user already exists.");
    }

    const exchange = await Exchange.create({
        initiator: initiatorId,
        receiver: receiverId,
        topicToLearn: topicToLearnId,
        topicToTeach: topicToTeachId,
    });

    // --- Notification Logic ---
    const notification = await Notification.create({
        user: receiverId,
        message: `${req.user.fullName} has sent you an exchange request.`,
        link: `/exchange/${exchange._id}`
    });
    const io = req.app.get('io');
    io.to(`user-${receiverId}`).emit('newNotification', notification);
    // --- End Notification Logic ---

    return res.status(201).json(new ApiResponse(201, exchange, "Exchange request sent successfully."));
});

const getExchangeDetails = asyncHandler(async (req, res) => {
    const { exchangeId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(exchangeId)) {
        throw new ApiError(400, "Invalid exchange ID.");
    }

    const exchange = await Exchange.findById(exchangeId)
        .populate('initiator', 'fullName username avatar')
        .populate('receiver', 'fullName username avatar')
        .populate('topicToLearn', 'name')
        .populate('topicToTeach', 'name');

    if (!exchange) {
        throw new ApiError(404, "Exchange not found.");
    }

    if (exchange.initiator._id.toString() !== userId.toString() && exchange.receiver._id.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to view this exchange.");
    }

    return res.status(200).json(new ApiResponse(200, exchange, "Exchange details retrieved successfully"));
});


const getUserExchanges = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const exchanges = await Exchange.find({ $or: [{ initiator: userId }, { receiver: userId }] })
        .populate('initiator', '_id fullName username')
        .populate('receiver', '_id fullName username')
        .populate('topicToLearn', '_id name')
        .populate('topicToTeach', '_id name')
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, exchanges, "User exchanges retrieved successfully"));
});


const updateExchangeStatus = asyncHandler(async (req, res) => {
    const { exchangeId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    
    if (!mongoose.Types.ObjectId.isValid(exchangeId)) {
        throw new ApiError(400, "Invalid exchange ID.");
    }

    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
        throw new ApiError(400, "Invalid status.");
    }
    
    const exchange = await Exchange.findById(exchangeId).populate('receiver', 'fullName');

    if (!exchange) {
        throw new ApiError(404, "Exchange not found.");
    }

    const isInitiator = exchange.initiator.equals(userId);
    const isReceiver = exchange.receiver.equals(userId);

    if ((status === 'accepted' || status === 'rejected') && (exchange.status !== 'pending' || !isReceiver)) {
        throw new ApiError(403, "You are not authorized to perform this action.");
    }

    if (status === 'completed') {
        if(exchange.status !== 'accepted') throw new ApiError(400, "Only an accepted exchange can be marked as completed.");
        if(!isInitiator && !isReceiver) throw new ApiError(403, "Only a participant can mark this as completed.");

        // --- Skill Node Completion Logic ---
        // Initiator learns `topicToLearn` from Receiver
        const initiatorLearnedTopicId = exchange.topicToLearn;
        const initiatorSkillNode = await SkillNode.findOne({ topic: initiatorLearnedTopicId });
        if (initiatorSkillNode) {
            await User.findByIdAndUpdate(exchange.initiator, {
                $addToSet: { completedSkillNodes: initiatorSkillNode._id }
            });
        }

        // Receiver learns `topicToTeach` from Initiator
        const receiverLearnedTopicId = exchange.topicToTeach;
        const receiverSkillNode = await SkillNode.findOne({ topic: receiverLearnedTopicId });
        if (receiverSkillNode) {
            await User.findByIdAndUpdate(exchange.receiver, {
                 $addToSet: { completedSkillNodes: receiverSkillNode._id }
            });
        }
        
        // --- Increment Teacher Stats ---
        // Both users taught something, so increment count for both.
        await User.updateMany(
            { _id: { $in: [exchange.initiator, exchange.receiver] } },
            { $inc: { exchangesAsTeacherCount: 1 } }
        );


        // --- Achievement Logic ---
        const io = req.app.get('io');
        // Check for both initiator and receiver
        await checkAchievementsOnExchangeComplete(exchange.initiator, io);
        await checkAchievementsOnExchangeComplete(exchange.receiver, io);
        // --- End Achievement Logic ---
    }
    
    if (status === 'cancelled') {
        if (exchange.status === 'pending' && !isInitiator) {
             throw new ApiError(403, "Only the initiator can cancel a pending request.");
        }
        if (exchange.status === 'accepted' && !isInitiator && !isReceiver) {
            throw new ApiError(403, "Only participants can cancel an active exchange.");
        }
    }

    exchange.status = status;
    await exchange.save();

    // --- Notification Logic for Acceptance ---
    if (status === 'accepted') {
        const notification = await Notification.create({
            user: exchange.initiator,
            message: `${exchange.receiver.fullName} accepted your exchange request.`,
            link: `/exchange/${exchange._id}`
        });
        const io = req.app.get('io');
        io.to(`user-${exchange.initiator}`).emit('newNotification', notification);
    }
    // --- End Notification Logic ---

    const updatedExchange = await Exchange.findById(exchangeId).populate('initiator receiver topicToLearn topicToTeach');

    return res.status(200).json(new ApiResponse(200, updatedExchange, `Exchange has been ${status}.`));
});

const submitReview = asyncHandler(async (req, res) => {
    const { exchangeId } = req.params;
    const { rating, review } = req.body;
    const reviewerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(exchangeId)) {
        throw new ApiError(400, "Invalid exchange ID.");
    }
    if (!rating || rating < 1 || rating > 5) {
        throw new ApiError(400, "A rating between 1 and 5 is required.");
    }

    const exchange = await Exchange.findById(exchangeId);
    if (!exchange) throw new ApiError(404, "Exchange not found.");
    if (exchange.status !== 'completed') throw new ApiError(400, "Can only review completed exchanges.");

    const isInitiator = exchange.initiator.equals(reviewerId);
    const isReceiver = exchange.receiver.equals(reviewerId);

    if (!isInitiator && !isReceiver) throw new ApiError(403, "You are not part of this exchange.");

    let ratedUserId, topicTaughtId;
    if (isInitiator) {
        if (exchange.initiatorRating) throw new ApiError(400, "You have already reviewed this exchange.");
        exchange.initiatorRating = rating;
        exchange.initiatorReview = review;
        ratedUserId = exchange.receiver;
        topicTaughtId = exchange.topicToLearn; // The receiver taught the initiator the topic they wanted to learn
    } else { // isReceiver
        if (exchange.receiverRating) throw new ApiError(400, "You have already reviewed this exchange.");
        exchange.receiverRating = rating;
        exchange.receiverReview = review;
        ratedUserId = exchange.initiator;
        topicTaughtId = exchange.topicToTeach; // The initiator taught the receiver the topic they offered to teach
    }

    await exchange.save();

    const ratedUser = await User.findById(ratedUserId);
    const oldTotalRating = ratedUser.averageRating * ratedUser.numberOfRatings;
    const newNumberOfRatings = ratedUser.numberOfRatings + 1;
    const newAverageRating = (oldTotalRating + rating) / newNumberOfRatings;

    ratedUser.averageRating = newAverageRating.toFixed(2);
    ratedUser.numberOfRatings = newNumberOfRatings;
    await ratedUser.save();

    // --- AI Review Summary Generation (Fire-and-Forget) ---
    const io = req.app.get('io');
    triggerReviewAnalysis(ratedUserId, io).catch(err => {
        console.error("Error triggering background review analysis:", err);
    });
    // --- End AI Review Summary Generation ---

    // --- Verified Skill Check ---
    checkAndAwardVerifiedSkill(ratedUserId, topicTaughtId, io).catch(err => {
        console.error("Error during skill verification check:", err);
    });
    // --- End Verified Skill Check ---

    return res.status(200).json(new ApiResponse(200, exchange, "Review submitted successfully."));
});

// --- New Recording Controllers ---

const uploadAudioRecording = asyncHandler(async (req, res) => {
    const { exchangeId } = req.params;
    const audioLocalPath = req.file?.path;

    if (!mongoose.Types.ObjectId.isValid(exchangeId)) {
        throw new ApiError(400, "Invalid exchange ID.");
    }
    if (!audioLocalPath) {
        throw new ApiError(400, "Audio file is missing.");
    }

    const exchange = await Exchange.findById(exchangeId);
    if (!exchange) {
        throw new ApiError(404, "Exchange not found.");
    }
    if (!exchange.initiator.equals(req.user._id) && !exchange.receiver.equals(req.user._id)) {
        throw new ApiError(403, "You are not a participant of this exchange.");
    }

    const audio = await uploadOnCloudinary(audioLocalPath, { resource_type: "video" });
    if (!audio || !audio.url) {
        throw new ApiError(500, "Error while uploading audio to cloud service");
    }

    const newRecording = await Recording.create({
        exchange: exchangeId,
        user: req.user._id,
        url: audio.secure_url,
        publicId: audio.public_id,
        duration: audio.duration,
    });
    
    // Asynchronously start the transcription process
    const io = req.app.get('io');
    processTranscription(newRecording._id, io).catch(err => {
        console.error("Failed to start transcription process:", err);
    });

    return res.status(201).json(new ApiResponse(201, newRecording, "Recording uploaded and transcription started."));
});

const getRecordingsForExchange = asyncHandler(async (req, res) => {
    const { exchangeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(exchangeId)) {
        throw new ApiError(400, "Invalid exchange ID.");
    }

    const exchange = await Exchange.findById(exchangeId);
    if (!exchange) {
        throw new ApiError(404, "Exchange not found.");
    }
    if (!exchange.initiator.equals(req.user._id) && !exchange.receiver.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to view these recordings.");
    }

    const recordings = await Recording.find({ exchange: exchangeId }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, recordings, "Recordings retrieved successfully."));
});


export {
    findMatches,
    createExchange,
    getExchangeDetails,
    getUserExchanges,
    updateExchangeStatus,
    submitReview,
    uploadAudioRecording,
    getRecordingsForExchange
};
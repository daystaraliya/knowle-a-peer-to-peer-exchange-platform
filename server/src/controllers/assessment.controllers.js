import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Topic } from "../models/topic.models.js";
import { SkillProficiency } from "../models/skillProficiency.models.js";
import { generateAssessmentQuestions, evaluateAssessmentAnswers } from "../utils/gemini.js";
import mongoose from "mongoose";

const startAssessment = asyncHandler(async (req, res) => {
    const { topicId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        throw new ApiError(400, "Invalid topic ID.");
    }
    
    const topic = await Topic.findById(topicId);
    if (!topic) {
        throw new ApiError(404, "Topic not found.");
    }

    const questions = await generateAssessmentQuestions(topic.name);

    if (!questions || questions.length === 0) {
        throw new ApiError(500, "Could not generate assessment questions.");
    }

    return res.status(200).json(new ApiResponse(200, { questions, topicName: topic.name }, "Assessment started successfully."));
});

const submitAssessment = asyncHandler(async (req, res) => {
    const { topicId } = req.params;
    const { questions, answers } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        throw new ApiError(400, "Invalid topic ID.");
    }
     if (!questions || !answers || questions.length === 0 || Object.keys(answers).length === 0) {
        throw new ApiError(400, "Questions and answers are required.");
    }
    
    const topic = await Topic.findById(topicId);
    if (!topic) {
        throw new ApiError(404, "Topic not found.");
    }

    const result = await evaluateAssessmentAnswers(topic.name, questions, answers);
    
    if (!result || !result.proficiency || !result.justification) {
        throw new ApiError(500, "AI evaluation failed or returned an invalid format.");
    }
    
    // Save or update the user's proficiency
    await SkillProficiency.findOneAndUpdate(
        { user: userId, topic: topicId },
        {
            proficiency: result.proficiency,
            lastAssessed: new Date(),
        },
        { upsert: true, new: true }
    );
    
    return res.status(200).json(new ApiResponse(200, result, "Assessment submitted and evaluated successfully."));
});

export { startAssessment, submitAssessment };
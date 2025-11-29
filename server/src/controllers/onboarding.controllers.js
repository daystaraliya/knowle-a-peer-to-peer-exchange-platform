import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { Topic } from "../models/topic.models.js";
import { getTopicSuggestionsForOnboarding } from "../utils/gemini.js";

// In a real application, these might be stored in the database.
const onboardingQuestions = [
    {
        id: 'interests',
        text: "What areas are you most passionate about or interested in learning? (Select up to 3)",
        type: 'multi-select',
        options: ['Technology & Programming', 'Arts & Creativity', 'Business & Finance', 'Health & Wellness', 'Languages & Culture', 'Science & Nature'],
    },
    {
        id: 'strengths',
        text: "Which of these best describes your current skills or profession?",
        type: 'single-select',
        options: ['Software Developer/Engineer', 'Designer or Artist', 'Marketing or Sales Professional', 'Student', 'Teacher or Academic', 'Healthcare Professional', 'Other'],
    },
    {
        id: 'goals',
        text: "What's your primary goal on Knowle?",
        type: 'single-select',
        options: ['Master a new skill for my career', 'Explore a new hobby', 'Connect with like-minded people', 'Share my expertise with others'],
    },
];


const getOnboardingQuestions = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, onboardingQuestions, "Onboarding questions retrieved successfully."));
});

const getAiSuggestions = asyncHandler(async (req, res) => {
    const { answers } = req.body;

    if (!answers) {
        throw new ApiError(400, "Answers are required to generate suggestions.");
    }

    const allTopics = await Topic.find().select('name');
    const suggestions = await getTopicSuggestionsForOnboarding(answers, allTopics);

    // Find the full topic documents for the suggested names
    const teachTopics = await Topic.find({ name: { $in: suggestions.teach } });
    const learnTopics = await Topic.find({ name: { $in: suggestions.learn } });

    return res.status(200).json(new ApiResponse(200, { teach: teachTopics, learn: learnTopics }, "AI suggestions generated successfully."));
});

const completeOnboarding = asyncHandler(async (req, res) => {
    const { topicsToTeach, topicsToLearn } = req.body;
    const userId = req.user._id;
    
    if (!Array.isArray(topicsToTeach) || !Array.isArray(topicsToLearn)) {
        throw new ApiError(400, "Topics must be provided as arrays of IDs.");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                topicsToTeach: topicsToTeach,
                topicsToLearn: topicsToLearn,
                onboardingCompleted: true,
            }
        },
        { new: true }
    );
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, { success: true }, "Onboarding completed and profile updated."));
});

export {
    getOnboardingQuestions,
    getAiSuggestions,
    completeOnboarding
};

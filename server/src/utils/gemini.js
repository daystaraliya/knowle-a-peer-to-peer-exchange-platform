import { GoogleGenAI, Type } from "@google/genai";
import { ApiError } from "./ApiError.js";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Gets AI-powered match recommendations from Gemini.
 * @param {object} currentUser - The user looking for matches.
 * @param {Array<object>} candidates - A list of potential candidates.
 * @returns {Promise<Array<{id: string, reason: string}>>} - A promise that resolves to an array of ranked matches with reasons.
 */
export const getAiPoweredMatches = async (currentUser, candidates) => {
    if (!currentUser || !candidates || candidates.length === 0) {
        return [];
    }

    const userProfileToString = (user) => {
        return `
        User ID: ${user._id}
        Full Name: ${user.fullName}
        Bio: ${user.bio || 'Not provided.'}
        Skills they know: ${user.topicsToTeach.map(t => t.name).join(', ') || 'None listed.'}
        Skills they want to learn: ${user.topicsToLearn.map(t => t.name).join(', ') || 'None listed.'}
        Languages they speak: ${user.languagesSpoken?.join(', ') || 'Not specified.'}
        `;
    };

    const prompt = `
    You are an intelligent matchmaking assistant for a knowledge exchange platform called "Knowle".
    Your task is to analyze a user's profile and a list of potential candidates to find the best learning partners.
    
    The user looking for matches is:
    ${userProfileToString(currentUser)}

    Here are the potential candidates:
    ${candidates.map(candidate => userProfileToString(candidate)).join('\n---\n')}

    Analyze each candidate's profile against the user's profile. A good match is someone who can teach what the user wants to learn, AND who wants to learn what the user can teach. Also consider their bios for potential shared interests and their spoken languages for compatibility.

    Based on your analysis, rank the candidates from best to worst match and provide a reason for why each is a good match. The reason should be concise, encouraging, and personalized (max 25 words).
    
    Return your response as a JSON array of objects. Each object must contain the candidate's "id" (which is their User ID) and a "reason" string. It is critical that you only return candidates from the provided list. The order of the array should reflect your ranking, from best to worst.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        },
                        required: ["id", "reason"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        
        // Robustness: Ensure the response can be parsed before using it.
        try {
            const result = JSON.parse(jsonText);
            if (Array.isArray(result)) {
                return result;
            }
            console.error("Gemini API returned valid JSON, but not the expected array format.");
            return []; // Fallback to empty array
        } catch (parseError) {
            console.error("Critical: Failed to parse Gemini API JSON response.", parseError);
            console.error("Received text from Gemini:", jsonText);
            return []; // Fallback to empty array
        }

    } catch (error) {
        console.error("Error calling Gemini API for matching:", error);
        // In case of an API error, return an empty array to allow the frontend to gracefully fallback.
        return [];
    }
};

/**
 * Analyzes a collection of user reviews to generate a summary of strengths and areas for improvement.
 * @param {Array<string>} reviews - An array of review text strings.
 * @returns {Promise<{positive: string[], negative: string[]}>} - A promise that resolves to an object with positive and negative themes.
 */
export const analyzeAllUserReviews = async (reviews) => {
    if (!reviews || reviews.length < 3) {
        return { positive: [], negative: [] };
    }

    const prompt = `
    You are an AI assistant for a platform called Knowle, designed to help users grow by analyzing their performance feedback.
    I will provide you with a JSON array of text reviews received by a user. Your task is to analyze these reviews and identify recurring themes.

    Reviews:
    ${JSON.stringify(reviews)}

    Based on the reviews, please perform the following:
    1.  Identify 2-4 common positive themes or strengths. These should be concise and encouraging.
    2.  Identify 1-3 common negative themes, but frame them constructively as "areas for growth". The tone must be polite and encouraging, not critical. For example, instead of "is always late", use "Some users mentioned a need for more punctuality in scheduling."
    3.  If there are no clear negative themes, return an empty array for "negative".
    4.  Weigh more recent reviews slightly more than older ones if you notice conflicting feedback, as this might indicate user improvement.

    Return your response as a single, valid JSON object with two keys: "positive" and "negative". Each key should hold an array of strings representing the themes you identified.
    Example:
    {
      "positive": ["Frequently praised for being patient and a clear communicator.", "Consistently noted for strong subject matter expertise."],
      "negative": ["A few reviews mentioned a lack of flexibility with scheduling.", "Some users noted a need for more real-world examples in lessons."]
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        positive: { type: Type.ARRAY, items: { type: Type.STRING } },
                        negative: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["positive", "negative"]
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error calling Gemini API for review analysis:", error);
        throw new ApiError(500, "Failed to analyze reviews with AI service.");
    }
};


/**
 * Transcribes audio using the Gemini API.
 * @param {Buffer} audioBuffer - The audio file content as a Buffer.
 * @returns {Promise<string>} - A promise that resolves to the transcribed text.
 */
export const transcribeAudioWithGemini = async (audioBuffer) => {
    try {
        const audioPart = {
            inlineData: {
                data: audioBuffer.toString('base64'),
                mimeType: 'audio/webm',
            },
        };
        const textPart = {
            text: "Transcribe the following audio recording of a conversation between two people. Provide the full transcript as plain text.",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Gemini 2.5 Flash supports audio
            contents: { parts: [audioPart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for transcription:", error);
        throw new ApiError(500, "Failed to transcribe audio with AI service.");
    }
};

/**
 * Generates skill assessment questions using Gemini.
 * @param {string} topicName - The name of the topic to generate questions for.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of question objects.
 */
export const generateAssessmentQuestions = async (topicName) => {
    const prompt = `You are an expert curriculum developer. For the topic of '${topicName}', generate a JSON array of exactly 5 multiple-choice questions to assess a user's proficiency. The questions should range in difficulty from novice to expert. Each question object must have an 'id' (from 1 to 5), a 'question' text, and an array of 4 string 'options'.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.NUMBER },
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["id", "question", "options"]
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error calling Gemini API for assessment questions:", error);
        throw new ApiError(500, "Failed to generate assessment questions with AI service.");
    }
};

/**
 * Evaluates a user's assessment answers using Gemini.
 * @param {string} topicName - The name of the topic.
 * @param {Array<object>} questions - The questions that were asked.
 * @param {object} answers - The user's answers, keyed by question ID.
 * @returns {Promise<object>} - A promise resolving to an object with `proficiency` and `justification`.
 */
export const evaluateAssessmentAnswers = async (topicName, questions, answers) => {
    const questionsAndAnswers = questions.map(q => ({
        question: q.question,
        userAnswer: answers[q.id] || "No answer provided"
    }));

    const prompt = `You are an expert technical interviewer. A user was assessed on the topic of '${topicName}'. Here are the questions they were asked and the answers they provided: ${JSON.stringify(questionsAndAnswers)}. Based on their answers, evaluate their proficiency level. Respond with a JSON object containing a 'proficiency' level (must be one of 'Novice', 'Intermediate', 'Advanced', or 'Expert') and a concise 'justification' (max 30 words) for your assessment. Be strict in your evaluation.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        proficiency: { type: Type.STRING },
                        justification: { type: Type.STRING }
                    },
                    required: ["proficiency", "justification"]
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error calling Gemini API for assessment evaluation:", error);
        throw new ApiError(500, "Failed to evaluate assessment with AI service.");
    }
};

/**
 * Generates topic suggestions for a new user based on their onboarding answers.
 * @param {object} answers - The user's answers from the questionnaire.
 * @param {Array<object>} allTopics - A list of all available topics on the platform.
 * @returns {Promise<{teach: string[], learn: string[]}>} - A promise resolving to suggested topic names.
 */
export const getTopicSuggestionsForOnboarding = async (answers, allTopics) => {
    const availableTopicNames = allTopics.map(t => t.name).join(', ');
    const prompt = `
        You are an onboarding assistant for a knowledge exchange platform.
        A new user has answered a questionnaire about their interests and skills.
        Their answers are: ${JSON.stringify(answers)}.
        The list of all available topics on the platform is: ${availableTopicNames}.

        Based on the user's answers, suggest a list of topics for them to teach and a list for them to learn.
        - "teach" suggestions should be based on their stated strengths and profession.
        - "learn" suggestions should be based on their interests and goals.
        - Only suggest topics that exist in the provided list of available topics.
        - Suggest between 2 and 4 topics for "teach".
        - Suggest between 2 and 4 topics for "learn".

        Return your response as a JSON object with two keys: "teach" and "learn". Each key should have an array of topic name strings as its value.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        teach: { type: Type.ARRAY, items: { type: Type.STRING } },
                        learn: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["teach", "learn"]
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error calling Gemini API for onboarding suggestions:", error);
        throw new ApiError(500, "Failed to get AI-powered suggestions.");
    }
};
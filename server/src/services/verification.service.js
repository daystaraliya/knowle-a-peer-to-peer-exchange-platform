import { VerifiedSkill } from '../models/verifiedSkill.models.js';
import { Exchange } from '../models/exchange.models.js';
import { Topic } from '../models/topic.models.js';

const MIN_EXCHANGES_FOR_VERIFICATION = 3;
const MIN_RATING_FOR_VERIFICATION = 4.5;

/**
 * Checks if a user qualifies for a "Verified Skill" badge for a specific topic after a review.
 * If they qualify, it awards the badge and sends a real-time notification.
 * This is designed to be called fire-and-forget.
 * @param {mongoose.Types.ObjectId} userId - The ID of the user who taught the skill.
 * @param {mongoose.Types.ObjectId} topicId - The ID of the topic that was taught.
 * @param {object} io - The Socket.IO server instance.
 */
export const checkAndAwardVerifiedSkill = async (userId, topicId, io) => {
    try {
        // 1. Check if the user already has this verified skill to avoid redundant checks.
        const existingVerification = await VerifiedSkill.findOne({ user: userId, topic: topicId });
        if (existingVerification) {
            return;
        }

        // 2. Find all completed exchanges where this user taught this specific topic.
        // The user is the `initiator` and they taught `topicToTeach`
        const exchangesAsInitiator = await Exchange.find({
            status: 'completed',
            initiator: userId,
            topicToTeach: topicId,
            receiverRating: { $exists: true, $ne: null }
        });

        // The user is the `receiver` and they taught `topicToLearn`
        const exchangesAsReceiver = await Exchange.find({
            status: 'completed',
            receiver: userId,
            topicToLearn: topicId,
            initiatorRating: { $exists: true, $ne: null }
        });

        const relevantExchanges = [...exchangesAsInitiator, ...exchangesAsReceiver];

        // 3. Check if the number of exchanges meets the threshold.
        if (relevantExchanges.length < MIN_EXCHANGES_FOR_VERIFICATION) {
            return;
        }

        // 4. Calculate the average rating for these specific exchanges.
        const ratings = [
            ...exchangesAsInitiator.map(e => e.receiverRating),
            ...exchangesAsReceiver.map(e => e.initiatorRating)
        ];
        const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
        const averageRating = totalRating / ratings.length;

        // 5. Check if the average rating meets the threshold.
        if (averageRating < MIN_RATING_FOR_VERIFICATION) {
            return;
        }

        // 6. If all criteria are met, award the verified skill.
        await VerifiedSkill.create({ user: userId, topic: topicId });
        console.log(`✅ Awarded verified skill for topic ${topicId} to user ${userId}`);

        // 7. Emit a real-time notification to the user.
        const topic = await Topic.findById(topicId).select('name');
        if (topic && io) {
            io.to(`user-${userId}`).emit('skillVerified', {
                topicName: topic.name,
            });
        }
    } catch (error) {
        console.error(`Error in skill verification service for user ${userId} and topic ${topicId}:`, error);
    }
};
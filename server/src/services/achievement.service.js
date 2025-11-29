import { Achievement } from '../models/achievement.models.js';
import { User } from '../models/user.models.js';
import { Exchange } from '../models/exchange.models.js';

/**
 * Checks if a user is eligible for a specific achievement and awards it if they are.
 * Emits a real-time notification upon awarding.
 * @param {object} user - The Mongoose user document.
 * @param {string} criteriaKey - The unique identifier for the achievement.
 * @param {object} io - The Socket.IO server instance.
 */
const checkAndAwardAchievement = async (user, criteriaKey, io) => {
    try {
        const achievement = await Achievement.findOne({ criteria: criteriaKey });
        if (!achievement) return;

        // Check if user already has this achievement
        const hasAchievement = user.achievements.some(achId => achId.equals(achievement._id));
        if (hasAchievement) return;

        // Award the achievement and points
        user.achievements.push(achievement._id);
        user.points += achievement.points;
        await user.save({ validateBeforeSave: false });

        // Emit a socket event for a real-time notification to the user
        io.to(`user-${user._id}`).emit('achievementUnlocked', {
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            points: achievement.points,
        });
    } catch (error) {
        console.error(`Error awarding achievement ${criteriaKey} to user ${user._id}:`, error);
    }
};

/**
 * Checks for all exchange-related achievements for a given user.
 * @param {mongoose.Types.ObjectId} userId - The ID of the user to check.
 * @param {object} io - The Socket.IO server instance.
 */
export const checkAchievementsOnExchangeComplete = async (userId, io) => {
    const user = await User.findById(userId);
    if (!user) return;

    const completedExchangesCount = await Exchange.countDocuments({
        $or: [{ initiator: userId }, { receiver: userId }],
        status: 'completed'
    });

    if (completedExchangesCount >= 1) {
        await checkAndAwardAchievement(user, 'FIRST_EXCHANGE', io);
    }
    if (completedExchangesCount >= 5) {
        await checkAndAwardAchievement(user, 'FIVE_EXCHANGES', io);
    }
    if (completedExchangesCount >= 10) {
        await checkAndAwardAchievement(user, 'TEN_EXCHANGES', io);
    }
};

// Placeholder for other achievement triggers
// export const checkAchievementsOnSkillNodeComplete = async (userId, io) => { ... };
// export const checkAchievementsOnProjectCreate = async (userId, io) => { ... };

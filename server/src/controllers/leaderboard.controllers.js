import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { Exchange } from "../models/exchange.models.js";

const getLeaderboard = asyncHandler(async (req, res) => {
    const { criteria = 'points', limit = 10 } = req.query;
    const limitNum = parseInt(limit, 10);

    let leaderboard;

    switch (criteria) {
        case 'points':
            leaderboard = await User.find()
                .sort({ points: -1 })
                .limit(limitNum)
                .select('fullName username avatar points');
            break;
            
        case 'exchanges':
            leaderboard = await Exchange.aggregate([
                // 1. Filter for completed exchanges
                { $match: { status: 'completed' } },
                
                // 2. Create an array of both participants for each exchange
                { $project: { participants: ['$initiator', '$receiver'] } },
                
                // 3. Unwind the participants array to create a document for each participant per exchange
                { $unwind: '$participants' },
                
                // 4. Group by participant ID and count their occurrences (which is their exchange count)
                { $group: { _id: '$participants', completedExchanges: { $sum: 1 } } },
                
                // 5. Sort by the highest exchange count
                { $sort: { completedExchanges: -1 } },
                
                // 6. Limit the results
                { $limit: limitNum },
                
                // 7. Look up user details from the 'users' collection
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                
                // 8. Unwind the user array created by the lookup
                { $unwind: '$user' },
                
                // 9. Project the final desired fields
                {
                    $project: {
                        _id: '$user._id',
                        fullName: '$user.fullName',
                        username: '$user.username',
                        avatar: '$user.avatar',
                        completedExchanges: 1
                    }
                }
            ]);
            break;

        case 'rating':
            leaderboard = await User.find({ numberOfRatings: { $gte: 1 } }) // Only rank users with at least one rating
                .sort({ averageRating: -1, numberOfRatings: -1 })
                .limit(limitNum)
                .select('fullName username avatar averageRating numberOfRatings');
            break;

        default:
            throw new ApiError(400, "Invalid leaderboard criteria.");
    }

    return res.status(200).json(new ApiResponse(200, leaderboard, `Leaderboard retrieved successfully.`));
});

export { getLeaderboard };
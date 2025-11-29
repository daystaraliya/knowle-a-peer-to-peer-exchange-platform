import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
    getAllMentors,
    getMentorOfferings,
    getMentorPremiumContent,
    getAllPremiumContent,
    createMentorshipOffering,
    createPremiumContent,
} from '../controllers/mentor.controllers.js';

const router = Router();

// Public routes for viewing mentor data
router.route('/').get(getAllMentors);
router.route('/:mentorId/offerings').get(getMentorOfferings);
router.route('/:mentorId/premium-content').get(getMentorPremiumContent);

// Protected routes
router.use(authMiddleware);

router.route('/premium-content').get(getAllPremiumContent);

// Mentor-only routes
router.route('/offerings').post(createMentorshipOffering);
router.route('/premium-content').post(createPremiumContent);

export default router;
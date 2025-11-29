import { Router } from 'express';
import {
    getOnboardingQuestions,
    getAiSuggestions,
    completeOnboarding
} from '../controllers/onboarding.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// All onboarding routes are protected
router.use(authMiddleware);

router.route('/').get(getOnboardingQuestions);
router.route('/suggest').post(getAiSuggestions);
router.route('/complete').post(completeOnboarding);

export default router;

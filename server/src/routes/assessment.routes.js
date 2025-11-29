import { Router } from 'express';
import { 
    startAssessment,
    submitAssessment
} from '../controllers/assessment.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// All assessment routes are protected
router.use(authMiddleware);

router.route('/start/:topicId').post(startAssessment);
router.route('/submit/:topicId').post(submitAssessment);

export default router;
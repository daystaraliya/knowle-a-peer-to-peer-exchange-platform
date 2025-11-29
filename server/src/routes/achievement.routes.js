import { Router } from 'express';
import { getUserAchievements } from '../controllers/achievement.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.route('/user/:userId').get(getUserAchievements);

export default router;
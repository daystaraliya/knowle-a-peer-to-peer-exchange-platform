import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboard.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.route('/').get(getLeaderboard);

export default router;
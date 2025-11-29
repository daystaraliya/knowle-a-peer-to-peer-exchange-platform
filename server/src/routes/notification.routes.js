import { Router } from 'express';
import { getUserNotifications, markNotificationsAsRead } from '../controllers/notification.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.route('/').get(getUserNotifications);
router.route('/read').patch(markNotificationsAsRead);

export default router;
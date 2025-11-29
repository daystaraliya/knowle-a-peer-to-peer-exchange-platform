import { Router } from 'express';
import { createTopic, getAllTopics } from '../controllers/topic.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.route('/').post(createTopic).get(getAllTopics);

export default router;

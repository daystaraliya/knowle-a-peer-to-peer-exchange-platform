import { Router } from 'express';
import { getPostWithReplies, createReply, toggleUpvote } from '../controllers/post.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

router.route('/:postId')
    .get(getPostWithReplies);

router.route('/:postId/reply')
    .post(createReply);
    
router.route('/:postId/upvote')
    .post(toggleUpvote);

export default router;

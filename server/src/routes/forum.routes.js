import { Router } from 'express';
import { getAllForums, createForum, getForumDetails } from '../controllers/forum.controllers.js';
import { getPostsByForum, createPost } from '../controllers/post.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

router.route('/')
    .get(getAllForums)
    .post(createForum);

router.route('/:forumId')
    .get(getForumDetails);

router.route('/:forumId/posts')
    .get(getPostsByForum)
    .post(createPost);


export default router;

import { Router } from 'express';
import {
    createFeatureRequest,
    getAllFeatureRequests,
    toggleUpvote,
} from '../controllers/featureRequest.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes are protected
router.use(authMiddleware);

router.route('/')
    .post(createFeatureRequest)
    .get(getAllFeatureRequests);
    
router.route('/:requestId/upvote')
    .post(toggleUpvote);

export default router;
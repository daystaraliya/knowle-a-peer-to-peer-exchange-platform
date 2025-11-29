import { Router } from 'express';
import {
    createResource,
    getAllResources,
    getResourceById,
    updateResource,
    deleteResource,
    toggleUpvoteResource,
} from '../controllers/resource.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// All resource routes are protected
router.use(authMiddleware);

router.route('/')
    .post(createResource)
    .get(getAllResources);

router.route('/:resourceId')
    .get(getResourceById)
    .patch(updateResource)
    .delete(deleteResource);

router.route('/:resourceId/upvote')
    .post(toggleUpvoteResource);

export default router;
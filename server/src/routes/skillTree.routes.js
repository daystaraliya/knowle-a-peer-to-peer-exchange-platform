import { Router } from 'express';
import {
    getAllSkillTrees,
    getSkillTreeDetails,
    getUserProgress
} from '../controllers/skillTree.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// All skill tree routes are protected
router.use(authMiddleware);

router.route('/').get(getAllSkillTrees);
router.route('/:treeId').get(getSkillTreeDetails);
router.route('/:treeId/progress').get(getUserProgress);

export default router;

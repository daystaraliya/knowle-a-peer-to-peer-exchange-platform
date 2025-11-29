import { Router } from 'express';
import { 
    createProject,
    getUserProjects,
    getProjectDetails,
    createTask,
    updateTask,
    deleteTask
} from '../controllers/project.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// All project routes are protected
router.use(authMiddleware);

// Project routes
router.route('/').post(createProject).get(getUserProjects);
router.route('/:projectId').get(getProjectDetails);

// Task routes
router.route('/:projectId/tasks').post(createTask);
router.route('/tasks/:taskId').patch(updateTask).delete(deleteTask);

export default router;
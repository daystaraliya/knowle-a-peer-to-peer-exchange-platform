import { Router } from 'express';
import { getRecordingDetails } from '../controllers/recording.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// All recording routes should be protected
router.use(authMiddleware);

router.route('/:recordingId').get(getRecordingDetails);

export default router;

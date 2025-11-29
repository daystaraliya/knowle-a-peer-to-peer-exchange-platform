import { Router } from 'express';
import { 
    findMatches, 
    createExchange, 
    getExchangeDetails,
    getUserExchanges,
    updateExchangeStatus,
    submitReview,
    uploadAudioRecording,
    getRecordingsForExchange
} from '../controllers/exchange.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// All exchange routes should be protected
router.use(authMiddleware);

router.route('/').get(getUserExchanges).post(createExchange);
router.route('/matches').get(findMatches);
router.route('/:exchangeId').get(getExchangeDetails);
router.route('/:exchangeId/status').patch(updateExchangeStatus);
router.route('/:exchangeId/review').post(submitReview);

// Recording-related routes within an exchange
router.route('/:exchangeId/recordings')
    .post(upload.single('audio'), uploadAudioRecording)
    .get(getRecordingsForExchange);

export default router;

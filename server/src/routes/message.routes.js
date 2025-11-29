import { Router } from 'express';
import { getMessagesForExchange } from '../controllers/message.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.route('/exchange/:exchangeId').get(getMessagesForExchange);

export default router;
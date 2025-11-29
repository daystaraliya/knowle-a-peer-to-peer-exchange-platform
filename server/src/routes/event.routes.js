import { Router } from 'express';
import {
    createEvent,
    getAllEvents,
    getEventById,
    registerForEvent,
    cancelRegistration,
    getHostedEvents,
    getRegisteredEvents,
} from '../controllers/event.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Public route to view events
router.route('/').get(getAllEvents);
router.route('/:eventId').get(getEventById);

// All subsequent routes are protected
router.use(authMiddleware);

router.route('/').post(createEvent);
router.route('/hosted/me').get(getHostedEvents);
router.route('/registered/me').get(getRegisteredEvents);
router.route('/:eventId/register').post(registerForEvent);
router.route('/:eventId/cancel').post(cancelRegistration);

export default router;
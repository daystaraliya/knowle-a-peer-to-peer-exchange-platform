import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createCheckoutSession } from '../controllers/payment.controllers.js';

const router = Router();

router.use(authMiddleware);

router.route('/create-checkout-session').post(createCheckoutSession);

// The Stripe webhook route is defined separately in app.js to handle raw body parsing.

export default router;
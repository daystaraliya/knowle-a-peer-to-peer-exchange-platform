import { Router } from 'express';
import { 
    registerUser, 
    loginUser, 
    logoutUser,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar
    // TODO: Add these functions to the controller:
    // updateUserTopics,
    // forgotPassword,
    // resetPassword,
    // getPublicUserProfile,
    // updateProfileVisibility,
    // getTeacherAnalytics,
    // regenerateReviewSummary
} from '../controllers/user.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Public routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
// TODO: Implement these routes when functions are added to controller:
// router.route('/forgot-password').post(forgotPassword);
// router.route('/reset-password/:token').post(resetPassword);
// router.route('/public/:username').get(getPublicUserProfile);

// Secured Routes
router.route('/logout').post(authMiddleware, logoutUser);
router.route('/profile').get(authMiddleware, getCurrentUser);
router.route('/profile').patch(authMiddleware, updateAccountDetails);
router.route('/avatar').patch(authMiddleware, upload.single('avatar'), updateUserAvatar);
// TODO: Implement these routes when functions are added to controller:
// router.route('/topics').patch(authMiddleware, updateUserTopics);
// router.route('/profile/visibility').patch(authMiddleware, updateProfileVisibility);
// router.route('/analytics/teacher').get(authMiddleware, getTeacherAnalytics);
// router.route('/reviews/regenerate').post(authMiddleware, regenerateReviewSummary);


export default router;
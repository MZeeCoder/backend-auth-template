import express from 'express';
import authController from './controller.js';
import { verifyToken, requireEmailVerified } from '../../middleware/authMiddleware.js';
import { avatarUpload } from '../../middleware/uploadMiddleware.js';


const router = express.Router();

// Public routes
router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/send-magic-link', authController.loginWithMagicLink);
router.post('/confirm-email', authController.confirmEmail); // Email confirmation from URL fragment
router.post('/verify-email', authController.verifyEmail); // OTP verification
router.post('/resend-confirmation', authController.resendConfirmation);
router.post('/refresh-token', authController.refreshToken);
router.post('/reset-password-request', authController.resetPasswordRequest);

// Protected routes (require authentication)
router.post('/logout', verifyToken, authController.logout);
router.get('/me', verifyToken, authController.getCurrentUser);
router.put('/update-password', verifyToken, authController.updatePassword);

// Avatar routes
router.post('/avatar/default', verifyToken, authController.generateDefaultAvatar);
router.post('/avatar/upload', verifyToken, avatarUpload.single('avatar'), authController.uploadAvatar);
router.delete('/avatar', verifyToken, authController.clearAvatar);

// Routes that require email verification
router.get('/profile', verifyToken, requireEmailVerified, (req, res) => {
    res.json({
        success: true,
        message: 'This is a protected route that requires email verification',
        user: req.user
    });
});

export default router;

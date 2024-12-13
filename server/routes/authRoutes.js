import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', authController.login);

// Protected routes
router.post('/register', authenticate, authorize('admin'), authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authenticate, authController.changePassword);
router.patch('/profile', authenticate, authController.updateProfile);

export default router;
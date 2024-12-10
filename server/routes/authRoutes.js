import express from 'express';
import { login, register } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', authenticate, authorize('admin'), register);

export default router;
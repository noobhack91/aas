import express from 'express';
import { initializeDatabase } from '../controllers/databaseController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/init', authenticate, authorize('admin'), initializeDatabase);

export default router;
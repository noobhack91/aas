import express from 'express';
import databaseController from '../controllers/databaseController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.post('/init', databaseController.initializeDatabase);
router.get('/stats', databaseController.getDatabaseStats);

export default router;
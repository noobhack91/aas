import express from 'express';
import adminController from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.patch('/users/:userId', adminController.updateUser);

// Role management
router.get('/roles', adminController.getRoles);
router.patch('/roles/:roleName', adminController.updateRole);

// System stats
router.get('/stats', adminController.getSystemStats);

export default router;  
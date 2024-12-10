import express from 'express';
import { getAllUsers, updateUserRoles } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();  

router.use(authenticate);  

// Only super admin can access these routes  
router.get('/users', authorize('super_admin'), getAllUsers);  
router.put('/users/role', authorize('super_admin'), updateUserRoles);  

export default router;  
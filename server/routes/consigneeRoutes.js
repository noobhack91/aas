import express from 'express';
import { getConsignees, updateConsigneeStatus, getConsigneeFiles,getConsigneeDetails,updateAccessoriesStatus } from '../controllers/consigneeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getConsignees);
router.get('/:id/files/:type', getConsigneeFiles);
router.patch('/:id', authorize('admin', 'logistics'), updateConsigneeStatus);
router.get('/:id/details', authenticate, getConsigneeDetails);  
router.patch('/:id/accessories', authenticate, authorize('logistics', 'admin'), updateAccessoriesStatus);  

export default router;
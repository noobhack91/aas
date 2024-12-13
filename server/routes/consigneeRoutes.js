import express from 'express';
import consigneeController from '../controllers/consigneeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// List and details
router.get('/', consigneeController.getConsignees);
router.get('/:id/details', consigneeController.getConsigneeDetails);

// Status updates
router.patch(
  '/:id/status',
  authorize('logistics_manager', 'admin'),
  consigneeController.updateConsignmentStatus
);

router.patch(
  '/:id/accessories',
  authorize('logistics_manager', 'admin'),
  consigneeController.updateAccessoriesStatus
);

export default router;
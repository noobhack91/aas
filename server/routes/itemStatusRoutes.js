import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getTenderItemsStatus,
  markAccessoryComplete,
  markConsumableComplete,
  markMultipleAccessoriesComplete,
  markMultipleConsumablesComplete
} from '../controllers/itemStatusController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get status of all items for a tender
router.get('/tenders/:tenderId/items-status', getTenderItemsStatus);

// Mark single accessory/consumable as complete
router.patch(
  '/tenders/:tenderId/accessories/:accessoryName/complete',
  authorize('admin', 'logistics'),
  markAccessoryComplete
);

router.patch(
  '/tenders/:tenderId/consumables/:consumableName/complete',
  authorize('admin', 'logistics'),
  markConsumableComplete
);

// Mark multiple items as complete
router.patch(
  '/tenders/:tenderId/accessories/complete-multiple',
  authorize('admin', 'logistics'),
  markMultipleAccessoriesComplete
);

router.patch(
  '/tenders/:tenderId/consumables/complete-multiple',
  authorize('admin', 'logistics'),
  markMultipleConsumablesComplete
);

export default router; 
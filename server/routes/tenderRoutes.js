import express from 'express';
import {
  exportTenderData,
  getBlocks,
  getDistricts,
  getTenderById,
  searchTenders,
  markAccessoryComplete,
  markConsumableComplete,
  getTenderItemsStatus
} from '../controllers/tenderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', searchTenders);
router.get('/districts', getDistricts);
router.get('/blocks', getBlocks);
router.get('/:id', getTenderById);
router.get('/:tenderId/export', exportTenderData);  
router.get('/:tenderId/items-status', authenticate, getTenderItemsStatus);
router.patch(
  '/:tenderId/accessories/:accessoryName/complete',
  authenticate,
  authorize('admin', 'logistics'),
  markAccessoryComplete
);
router.patch(
  '/:tenderId/consumables/:consumableName/complete',
  authenticate,
  authorize('admin', 'logistics'),
  markConsumableComplete
);

export default router;
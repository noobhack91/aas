import express from 'express';
import {
  exportTenderData,
  getBlocks,
  getDistricts,
  getTenderById,
  searchTenders
} from '../controllers/tenderController.js';

const router = express.Router();

router.get('/search', searchTenders);
router.get('/districts', getDistricts);
router.get('/blocks', getBlocks);
router.get('/:id', getTenderById);
router.get('/:tenderId/export', exportTenderData);  

export default router;
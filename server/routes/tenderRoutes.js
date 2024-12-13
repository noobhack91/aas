import express from 'express';
import tenderController from '../controllers/tenderController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../utils/fileUpload.js';
import documentController from '../controllers/documentController.js';

const router = express.Router();

router.use(authenticate);

// Search and list
router.get('/search', tenderController.searchTenders);
router.get('/districts', tenderController.getDistricts);
router.get('/blocks', tenderController.getBlocks);

// CRUD operations
router.post(
  '/', 
  authorize('admin', 'tender_manager'), 
  tenderController.createTender
);
router.get('/:id', tenderController.getTenderById);
router.patch(
  '/:id', 
  authorize('admin', 'tender_manager'), 
  tenderController.updateTender
);
router.delete(
  '/:id', 
  authorize('admin'), 
  tenderController.deleteTender
);

// Export
router.get(
  '/:tenderId/export', 
  authorize('admin', 'tender_manager'), 
  tenderController.exportTenderData
);

// Stats
router.get('/stats', tenderController.getTenderStats);

// LOA Routes
router.post(
  '/:tenderId/loa',
  authenticate,
  upload.single('file'),
  documentController.uploadLOA
);

router.get(
  '/:tenderId/loa',
  authenticate,
  documentController.getLOA
);

// PO Routes
router.post(
  '/:tenderId/po',
  authenticate,
  upload.single('file'),
  documentController.uploadPO
);

router.get(
  '/:tenderId/po',
  authenticate,
  documentController.getPO
);

export default router;
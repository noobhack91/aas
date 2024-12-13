import express from 'express';
import uploadController from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Logistics documents
router.post(
  '/logistics',
  authorize('logistics_manager', 'admin'),
  upload.array('documents', 5),
  uploadController.uploadLogistics
);

// Challan receipt
router.post(
  '/challan',
  authorize('logistics_manager', 'admin'),
  upload.single('file'),
  uploadController.uploadChallan
);

// Installation report
router.post(
  '/installation',
  authorize('installer', 'admin'),
  upload.single('file'),
  uploadController.uploadInstallation
);

// Invoice
router.post(
  '/invoice',
  authorize('finance_manager', 'admin'),
  upload.single('file'),
  uploadController.uploadInvoice
);

// File deletion
router.delete(
  '/file',
  authorize('admin'),
  uploadController.deleteFile
);

export default router;
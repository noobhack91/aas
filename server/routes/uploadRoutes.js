import express from 'express';
import { upload } from '../middleware/upload.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  uploadLogistics,
  uploadChallan,
  uploadInstallation,
  uploadInvoice,
  deleteFile
} from '../controllers/uploadController.js';

const router = express.Router();

router.use(authenticate);

// File upload routes
router.post(
  '/logistics',
  authorize('logistics', 'admin'),
  upload.array('documents', 5),
  uploadLogistics
);

router.post(
  '/challan',
  authorize('challan', 'admin'),
  upload.single('file'),
  uploadChallan
);

router.post(
  '/installation',
  authorize('installation', 'admin'),
  upload.single('file'),
  uploadInstallation
);

router.post(
  '/invoice',
  authorize('invoice', 'admin'),
  upload.single('file'),
  uploadInvoice
);

// File deletion routes
router.delete(
  '/:type/file',
  authorize('admin', 'logistics', 'challan', 'installation', 'invoice'),
  deleteFile
);

export default router;
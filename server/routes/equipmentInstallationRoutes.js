import express from 'express';
import multer from 'multer';
import equipmentInstallationController from '../controllers/equipmentInstallationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

// Installation requests
router.post(
  '/',
  authorize('admin', 'installer'),
  equipmentInstallationController.createInstallationRequest
);

router.get(
  '/',
  authorize('admin', 'installer', 'logistics_manager'),
  equipmentInstallationController.getInstallationRequests
);

router.patch(
  '/:id/status',
  authorize('admin', 'installer'),
  equipmentInstallationController.updateInstallationStatus
);

// CSV operations
router.post(
  '/:id/upload-csv',
  authorize('admin', 'installer'),
  upload.single('file'),
  equipmentInstallationController.processCSVUpload
);

router.get(
  '/template',
  authorize('admin', 'installer'),
  equipmentInstallationController.downloadTemplate
);

export default router;
import express from 'express';
import multer from 'multer';
import {
  createInstallationRequest,
  getInstallationRequests,
  uploadConsigneeCSV,
  downloadTemplate
} from '../controllers/equipmentInstallationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

// Rename routes to reflect that we're working with tenders
router.post('/', authorize('admin'), createInstallationRequest);
router.get('/', authorize('admin', 'logistics', 'installation'), getInstallationRequests);
router.post('/upload-csv', authorize('admin'), upload.single('file'), uploadConsigneeCSV);
router.get('/template', authorize('admin'), downloadTemplate);

export default router;
import express from 'express';
import multer from 'multer';
import {
  createInstallationRequest,
  downloadTemplate,
  getInstallationRequests,
  uploadConsigneeCSV
} from '../controllers/equipmentInstallationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for handling multipart/form-data
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 3 // Allow up to 3 files
  }
});

// Configure the fields for document upload
const documentUpload = upload.fields([
  { name: 'tenderDoc', maxCount: 1 },
  { name: 'loaDoc', maxCount: 1 },
  { name: 'poDoc', maxCount: 1 },
  { name: 'data', maxCount: 1 } // Add this to handle the data field
]);

router.post('/',
  authenticate,
  authorize('admin'),
  documentUpload,
  createInstallationRequest
);
router.get('/', authenticate, authorize('admin', 'logistics', 'installation'), getInstallationRequests);
router.post('/upload-csv', authenticate, authorize('admin'), upload.single('file'), uploadConsigneeCSV);
router.get('/template', authenticate, authorize('admin'), downloadTemplate);

export default router;
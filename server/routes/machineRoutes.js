import express from 'express';
import {
  getMachines,
  createMachine,
  updateMachine,
  deleteMachine
} from '../controllers/machineController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getMachines);
router.post('/', authorize('admin'), createMachine);
router.put('/:id', authorize('admin'), updateMachine);
router.delete('/:id', authorize('admin'), deleteMachine);

export default router; 
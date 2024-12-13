import express from 'express';
import adminRoutes from './adminRoutes.js';
import authRoutes from './authRoutes.js';
import consigneeRoutes from './consigneeRoutes.js';
import databaseRoutes from './databaseRoutes.js';
import equipmentInstallationRoutes from './equipmentInstallationRoutes.js';
import itemsRoutes from './itemsRoutes.js';
import tenderRoutes from './tenderRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = express.Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/admin', adminRoutes);
router.use('/consignees', consigneeRoutes);
router.use('/database', databaseRoutes);
router.use('/equipment-installation', equipmentInstallationRoutes);
router.use('/items', itemsRoutes);
router.use('/tenders', tenderRoutes);
router.use('/upload', uploadRoutes);

export default router;
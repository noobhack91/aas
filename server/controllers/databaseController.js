import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import logger from '../config/logger.js';
import { Consignee, sequelize, Tender, User } from '../models/index.js';

dotenv.config();

export const initializeDatabase = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // Drop and recreate all tables
    await sequelize.sync({ force: true });
    logger.info('Database tables recreated successfully');

    // Create default users
    const password = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'admin123', 10);
    const roles = ['admin', 'logistics', 'challan', 'installation', 'invoice'];

    const users = [];
    for (const role of roles) {
      const user = await User.create({
        username: role,
        email: `${role}@example.com`,
        password,
        role,
        isActive: true
      }, { transaction });
      users.push(user);
      logger.info(`Created user with role: ${role}`);
    }

    // Create sample tenders
    const tenders = await Tender.bulkCreate([
      {
        tenderNumber: 'TENDER/2024/001',
        authorityType: 'State Health Department',
        poDate: new Date('2024-03-01'),
        contractDate: new Date('2024-02-15'),
        leadTimeToInstall: 30,
        leadTimeToDeliver: 15,
        equipmentName: 'X-Ray Machine',
        status: 'Pending',
        accessoriesPending: false,
        installationPending: true,
        invoicePending: true
      },
      {
        tenderNumber: 'TENDER/2024/002',
        authorityType: 'Central Medical Supplies',
        poDate: new Date('2024-03-05'),
        contractDate: new Date('2024-02-20'),
        leadTimeToInstall: 45,
        leadTimeToDeliver: 20,
        equipmentName: 'MRI Scanner',
        status: 'Partially Completed',
        accessoriesPending: true,
        installationPending: true,
        invoicePending: true
      }
    ], { transaction });

    // Create sample consignees
    const consignees = await Consignee.bulkCreate([
      {
        tenderId: tenders[0].id,
        srNo: 'SR001',
        districtName: 'North District',
        blockName: 'Block A',
        facilityName: 'City Hospital',
        consignmentStatus: 'Processing',
        accessoriesPending: {
          status: false,
          count: 0,
          items: []
        }
      },
      {
        tenderId: tenders[0].id,
        srNo: 'SR002',
        districtName: 'South District',
        blockName: 'Block B',
        facilityName: 'Rural Health Center',
        consignmentStatus: 'Dispatched',
        accessoriesPending: {
          status: true,
          count: 2,
          items: ['Cable', 'Battery']
        },
        serialNumber: 'XR2024001'
      }
    ], { transaction });

    await transaction.commit();

    res.json({
      message: 'Database initialized successfully',
      users: users.map(u => ({ username: u.username, role: u.role })),
      tenders: tenders.map(t => ({ tenderNumber: t.tenderNumber, status: t.status })),
      consignees: consignees.map(c => ({ srNo: c.srNo, district: c.districtName }))
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Database initialization failed:', error);
    res.status(500).json({ error: error.message });
  }
};
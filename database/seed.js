import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import logger from '../server/config/logger.js';
import { sequelize } from '../server/config/database.js';
import models from '../server/models/index.js';

dotenv.config();

const { User, Tender, Consignee } = models;

async function createUsers(transaction) {
  const password = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'admin123', 10);
  
  const users = [
    { 
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true
    },
    { 
      username: 'logistics',
      email: 'logistics@example.com',
      role: 'logistics',
      isActive: true
    },
    // Add more default users as needed
  ];

  const createdUsers = await User.bulkCreate(
    users.map(user => ({
      ...user,
      id: uuidv4(),
      password
    })),
    { transaction }
  );

  logger.info(`Created ${createdUsers.length} default users`);
  return createdUsers;
}

async function createSampleTenders(adminUser, transaction) {
  const tenders = [
    {
      tenderNumber: 'TENDER/2024/001',
      authorityType: 'UPMSCL',
      poDate: new Date('2024-03-01'),
      contractDate: new Date('2024-02-15'),
      leadTimeToInstall: 30,
      leadTimeToDeliver: 15,
      equipmentName: 'X-Ray Machine',
      equipmentSpecification: {
        model: 'XR-2000',
        manufacturer: 'Medical Systems Inc',
        features: ['Digital imaging', 'Cloud storage']
      },
      warrantyPeriod: 24,
      status: 'Draft',
      createdBy: adminUser.id
    },
    // Add more sample tenders
  ];

  const createdTenders = await Tender.bulkCreate(
    tenders.map(tender => ({
      ...tender,
      id: uuidv4()
    })),
    { transaction }
  );

  logger.info(`Created ${createdTenders.length} sample tenders`);
  return createdTenders;
}

async function createSampleConsignees(tenders, transaction) {
  const consignees = tenders.flatMap(tender => ([
    {
      tenderId: tender.id,
      srNo: `SR${Math.floor(Math.random() * 1000)}`,
      districtName: 'Sample District',
      blockName: 'Sample Block',
      facilityName: 'District Hospital',
      facilityType: 'Hospital',
      contactPerson: 'John Doe',
      contactNumber: '9876543210',
      email: 'hospital@example.com',
      address: 'Sample Address',
      pincode: '123456',
      consignmentStatus: 'Processing'
    },
    // Add more sample consignees
  ]));

  const createdConsignees = await Consignee.bulkCreate(
    consignees.map(consignee => ({
      ...consignee,
      id: uuidv4()
    })),
    { transaction }
  );

  logger.info(`Created ${createdConsignees.length} sample consignees`);
}

async function seedDatabase() {
  const transaction = await sequelize.transaction();

  try {
    // Create users
    const users = await createUsers(transaction);
    const adminUser = users.find(u => u.role === 'admin');

    // Create sample data
    const tenders = await createSampleTenders(adminUser, transaction);
    await createSampleConsignees(tenders, transaction);

    await transaction.commit();
    logger.info('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
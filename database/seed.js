import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import logger from '../server/config/logger.js';
import { sequelize } from '../server/config/database.js';
import models from '../server/models/index.js';

dotenv.config();

class DatabaseSeeder {
  constructor() {
    this.models = models;
    this.defaultPassword = process.env.DEFAULT_PASSWORD || 'admin123';
  }

  async seed() {
    const transaction = await sequelize.transaction();

    try {
      // Create users
      const users = await this.createUsers(transaction);
      const adminUser = users.find(u => u.role === 'admin');

      await transaction.commit();
      logger.info('Database seeded successfully!');
      process.exit(0);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error seeding database:', error);
      process.exit(1);
    }
  }

  async createUsers(transaction) {
    const password = await bcrypt.hash(this.defaultPassword, 10);
    
    const users = [
      { 
        username: 'admin',
        email: 'admin@example.com',
        roles: ['admin'],
        isActive: true
      },
      { 
        username: 'logistics',
        email: 'logistics@example.com',
        roles: ['logistics_manager'],
        isActive: true
      },
      {
        username: 'installer',
        email: 'installer@example.com',
        roles: ['installer'],
        isActive: true
      }
    ];

    const createdUsers = await this.models.User.bulkCreate(
      users.map(user => ({
        ...user,
        id: uuidv4(),
        password
      })),
      { 
        transaction,
        returning: true
      }
    );

    logger.info(`Created ${createdUsers.length} default users`);
    return createdUsers;
  }
}

// Run seeder
const seeder = new DatabaseSeeder();
seeder.seed();
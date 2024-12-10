import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import logger from '../server/config/logger.js';
import { sequelize, User } from '../server/models/index.js';

dotenv.config();
async function initDatabase() {
  const transaction = await sequelize.transaction();

  try {
    // Drop and recreate all tables
    await sequelize.sync({ force: true });
    logger.info('Database tables recreated successfully');

    // Create default users
    const password = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'admin123', 10)
    const roles = ['admin', 'logistics', 'challan', 'installation', 'invoice'];
    
    for (const role of roles) {
      await User.create({
        username: role,
        email: `${role}@example.com`,
        password,
        role,
        isActive: true
      }, { transaction });
      logger.info(`Created user with role: ${role}`);
    }

  
    await transaction.commit();
    logger.info('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    logger.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
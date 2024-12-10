import bcrypt from 'bcryptjs';
import { User } from '../server/models/index.js';
import sequelize from '../server/config/database.js';
import logger from '../server/config/logger.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  try {
    await sequelize.sync({ force: true });
    
    const password = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'admin123', 10);
    
    const users = [
      { username: 'admin', email: 'admin@example.com', role: 'admin' },
      { username: 'logistics', email: 'logistics@example.com', role: 'logistics' },
      { username: 'challan', email: 'challan@example.com', role: 'challan' },
      { username: 'installation', email: 'installation@example.com', role: 'installation' },
      { username: 'invoice', email: 'invoice@example.com', role: 'invoice' }
    ];

    for (const userData of users) {
      await User.create({
        ...userData,
        password,
        isActive: true
      });
      logger.info(`Created user: ${userData.username}`);
    }

    logger.info('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
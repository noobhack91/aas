import models from '../server/models/index.js';
import logger from '../server/config/logger.js';

async function migrate() {
  try {
    await models.sequelize.sync({ alter: true });
    logger.info('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  }
}

migrate();
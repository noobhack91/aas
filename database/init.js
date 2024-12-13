import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import logger from '../server/config/logger.js';

dotenv.config();

async function initializeDatabase() {
  // Define database configuration
  const dbConfig = {
    database: 'equipment_management',
    username: 'postgres',
    password: 'admin',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };

  // Override with environment variables if they exist
  if (process.env.DB_NAME) dbConfig.database = process.env.DB_NAME;
  if (process.env.DB_USER) dbConfig.username = process.env.DB_USER;
  if (process.env.DB_PASSWORD) dbConfig.password = process.env.DB_PASSWORD;
  if (process.env.DB_HOST) dbConfig.host = process.env.DB_HOST;
  if (process.env.DB_PORT) dbConfig.port = parseInt(process.env.DB_PORT);

  try {
    // Create Sequelize instance
    const sequelize = new Sequelize(dbConfig);

    // Test connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Create database if it doesn't exist
    const rootSequelize = new Sequelize({
      ...dbConfig,
      database: 'postgres', // Connect to default postgres database
      logging: false
    });

    try {
      await rootSequelize.query(
        `CREATE DATABASE ${dbConfig.database}
         WITH OWNER = ${dbConfig.username}
         ENCODING = 'UTF8'
         LC_COLLATE = 'en_US.utf8'
         LC_CTYPE = 'en_US.utf8'
         TEMPLATE template0;`
      );
      logger.info(`Database '${dbConfig.database}' created successfully.`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        logger.info(`Database '${dbConfig.database}' already exists.`);
      } else {
        throw error;
      }
    } finally {
      await rootSequelize.close();
    }

    // Close the connection
    await sequelize.close();
    logger.info('Database initialization completed.');
    process.exit(0);
  } catch (error) {
    logger.error('Database initialization failed:', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
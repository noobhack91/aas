import { Sequelize } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';
import logger from '../server/config/logger.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'equipment_management',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'admin',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres',
      logging: msg => logger.debug(msg),
    }
  );

  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    
    // Split the SQL file into individual statements
    const statements = schemaSql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement in a transaction
    await sequelize.transaction(async (t) => {
      for (const statement of statements) {
        await sequelize.query(statement, { transaction: t });
      }
      logger.info('Schema migration completed successfully');
    });

    // Sync Sequelize models
    await sequelize.sync({ alter: true });
    logger.info('Model synchronization completed successfully');

    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
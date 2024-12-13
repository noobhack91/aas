import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import logger from '../server/config/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function alterUserRoleToRoles(sequelize) {
  const transaction = await sequelize.transaction();
  
  try {
    // Read the migration SQL
    const migrationPath = path.join(__dirname, 'migrations', 'alter_user_role_to_roles.sql');
    const migrationSql = await fs.readFile(migrationPath, 'utf8');
    
    // Execute the migration
    await sequelize.query(migrationSql, { transaction });
    
    await transaction.commit();
    logger.info('User role column migration completed successfully');
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function fixAuditLogsColumns(sequelize) {
  const transaction = await sequelize.transaction();
  
  try {
    const migrationPath = path.join(__dirname, 'migrations', 'fix_audit_logs_columns.sql');
    const migrationSql = await fs.readFile(migrationPath, 'utf8');
    
    await sequelize.query(migrationSql, { transaction });
    
    await transaction.commit();
    logger.info('Audit logs columns fixed successfully');
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

class DatabaseMigrator {
  constructor() {
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

    // Log the configuration (excluding sensitive data)
    logger.info('Database configuration:', {
      database: dbConfig.database,
      username: dbConfig.username,
      host: dbConfig.host,
      port: dbConfig.port
    });

    this.sequelize = new Sequelize(dbConfig);
  }

  async migrate() {
    try {
      // Test database connection
      await this.sequelize.authenticate();
      logger.info('Database connection established successfully.');

      // Read schema files
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSql = await fs.readFile(schemaPath, 'utf8');

      // Execute schema
      await this.executeSchema(schemaSql);
      
      // Run the role to roles migration
      await alterUserRoleToRoles(this.sequelize);
      
      // Run the audit logs fix
      await fixAuditLogsColumns(this.sequelize);
      
      logger.info('Migration completed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Migration failed:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      process.exit(1);
    }
  }

  parseStatements(sql) {
    const statements = [];
    let currentStatement = '';
    let inDollarQuote = false;
    let dollarTag = '';
    
    // Split into lines and process
    const lines = sql.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('--')) {
        continue;
      }
      
      // Check for dollar quotes
      if (!inDollarQuote && trimmedLine.includes('$$')) {
        inDollarQuote = true;
        dollarTag = '$$';
      }
      
      // Add line to current statement
      currentStatement += line + '\n';
      
      // Check if we're exiting a dollar quote
      if (inDollarQuote && 
          trimmedLine.includes(dollarTag) && 
          currentStatement.split(dollarTag).length > 2) {
        inDollarQuote = false;
      }
      
      // If we're not in a dollar quote and the line ends with a semicolon
      if (!inDollarQuote && trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    return statements;
  }

  async executeSchema(schemaSql) {
    const statements = this.parseStatements(schemaSql);
    const transaction = await this.sequelize.transaction();
    
    try {
      for (const statement of statements) {
        if (statement.trim()) {
          await this.sequelize.query(statement, { 
            transaction,
            raw: true
          });
        }
      }
      
      await transaction.commit();
      logger.info('Schema migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

// Run migration
const migrator = new DatabaseMigrator();
migrator.migrate().catch(error => {
  logger.error('Migration failed:', error);
  process.exit(1);
});
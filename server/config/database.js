import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import logger from './logger.js';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'equipment_management',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'admin',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  },

);

export { sequelize };
export default sequelize;
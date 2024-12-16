import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'url';
import path from 'path';
import logger from './config/logger.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sequelize } from './config/database.js';
import { createContainers } from './utils/azureStorage.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

// Create logs directory if it doesn't exist
import { mkdirSync } from 'fs';
try {
  mkdirSync(path.join(__dirname, '../logs'));
} catch (err) {
  if (err.code !== 'EEXIST') throw err;
}

// Initialize Azure Storage containers
createContainers().catch(err => {
  logger.error('Failed to initialize Azure containers:', err);
});

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}).catch(err => {
  logger.error('Database connection failed:', err);
});

export default app;
import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  const error = {
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  };

  // Log error details  
  logger.error({
    ...error,
    stack: err.stack,
    user: req.user?.id
  });

  // Handle specific error types  
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Resource already exists',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Generic error response  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    requestId: req.id
  });
};  
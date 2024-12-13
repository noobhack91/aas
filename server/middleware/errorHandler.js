import { ValidationError, UniqueConstraintError } from 'sequelize';
import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log error with request context
  logger.error({
    error: err,
    user: req.user?.id,
    path: req.path,
    method: req.method,
    body: req.body
  });

  // Handle specific error types
  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      status: 'error',
      message: 'Resource already exists',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Add more specific error handlers
  const errorTypes = {
    UnauthorizedError: 401,
    ForbiddenError: 403,
    NotFoundError: 404
  };

  const statusCode = errorTypes[err.name] || 500;

  res.status(statusCode).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? statusCode === 500 ? 'Internal server error' : err.message
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};  
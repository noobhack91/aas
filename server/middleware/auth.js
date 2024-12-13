import jwt from 'jsonwebtoken';  
import logger from '../config/logger.js';  
import { User } from '../models/index.js';  

// Middleware to authenticate the user  
export const authenticate = async (req, res, next) => {  
  try {  
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header  

    if (!token) {  
      throw new Error('No token provided');  
    }  

    // Verify the token  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  

    // Find the user in the database  
    const user = await User.findByPk(decoded.id);  

    if (!user || !user.isActive) {  
      throw new Error('User not found or inactive');  
    }  

    // Attach the user to the request object  
    req.user = user;  
    next();  
  } catch (error) {  
    next(error);  
  }  
};  

// Middleware to authorize based on roles  
export const authorize = (roles, options = { requireAll: false }) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new Error('User not authenticated'));
    }

    const userRoles = req.user.roles;
    const hasAccess = options.requireAll
      ? roles.every(role => userRoles.includes(role))
      : roles.some(role => userRoles.includes(role));

    if (!hasAccess) {
      logger.warn(
        `Access denied for user ${req.user.id} with roles [${userRoles.join(', ')}]`
      );
      return next(new Error('Insufficient permissions'));
    }

    next();
  };
};

// Middleware to authorize based on multiple roles (array of roles)  
export const authorizeRoles = (...allowedRoles) => {  
  return (req, res, next) => {  
    try {  
      const userRoles = req.user.roles || []; // Array of roles (e.g., ['admin', 'logistics'])  

      // Check if the user has at least one of the allowed roles  
      const hasAccess = allowedRoles.some((role) => userRoles.includes(role));  

      if (!hasAccess) {  
        logger.warn(  
          `Unauthorized access attempt by user ${req.user.id} with roles [${userRoles.join(  
            ', '  
          )}]. Allowed roles: ${allowedRoles.join(', ')}`  
        );  
        return res.status(403).json({  
          error: 'You do not have permission to perform this action',  
        });  
      }  

      next();  
    } catch (error) {  
      logger.error('Authorization error:', error);  
      res.status(403).json({ error: 'Access denied' });  
    }  
  };  
};  
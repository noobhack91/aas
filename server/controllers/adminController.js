import logger from '../config/logger.js';
import { User } from '../models/index.js';

export const updateUserRoles = async (req, res) => {
  try {
    const { userId, roles } = req.body;

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: 'Roles must be a non-empty array' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.roles = roles; // Assign new roles  
    await user.save();

    logger.info(`User ${userId} roles updated by admin`);
    res.json({ message: 'User roles updated successfully', user });
  } catch (error) {
    logger.error('Error updating user roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'roles', 'isActive'],
    });
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


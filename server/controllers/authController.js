import bcrypt from 'bcryptjs';
import { ValidationError } from 'sequelize';
import logger from '../config/logger.js';
import { User } from '../models/index.js';
import { logActivity } from '../services/auditService.js';

class AuthController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ 
        where: { username },
        attributes: ['id', 'username', 'email', 'password', 'roles', 'isActive'] 
      });

      if (!user || !user.isActive) {
        logger.warn(`Failed login attempt for username: ${username}`);
        return next(new Error('Invalid credentials'));
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        logger.warn(`Invalid password for username: ${username}`);
        return next(new Error('Invalid credentials'));
      }

      await user.update({ lastLogin: new Date() });
      const token = user.generateAuthToken();

      await logActivity(user.id, 'LOGIN', 'User', user.id);

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const { username, email, password, roles } = req.body;

      // Validate roles if provided
      if (roles && !req.user?.hasRole('admin')) {
        return next(new Error('Insufficient permissions to assign roles'));
      }

      const user = await User.create({
        username,
        email,
        password,
        roles: roles || ['user']
      });

      await logActivity(
        req.user?.id || user.id,
        'REGISTER',
        'User',
        user.id,
        {},
        { username, email, roles: user.roles }
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles
        }
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return next(error);
      }
      next(new Error('Registration failed'));
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return next(new Error('No user found with this email'));
      }

      const resetToken = await user.generatePasswordResetToken();

      // TODO: Implement email service to send reset token
      logger.info(`Password reset token generated for user: ${user.id}`);

      res.json({ 
        message: 'Password reset instructions sent to email',
        // Only include token in development
        ...(process.env.NODE_ENV !== 'production' && { token: resetToken })
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { [Op.gt]: new Date() }
        }
      });

      if (!user) {
        return next(new Error('Invalid or expired reset token'));
      }

      user.password = password;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      await logActivity(user.id, 'RESET_PASSWORD', 'User', user.id);

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return next(new Error('Current password is incorrect'));
      }

      user.password = newPassword;
      await user.save();

      await logActivity(user.id, 'CHANGE_PASSWORD', 'User', user.id);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findByPk(req.user.id);

      const oldValues = { email: user.email };
      await user.update({ email });

      await logActivity(
        user.id,
        'UPDATE_PROFILE',
        'User',
        user.id,
        oldValues,
        { email }
      );

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();  
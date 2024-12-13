import { Op } from 'sequelize';
import logger from '../config/logger.js';
import { Role, User, sequelize } from '../models/index.js';
import { logActivity } from '../services/auditService.js';

class AdminController {
  async getAllUsers(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        role,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const whereClause = {
        ...(search && {
          [Op.or]: [
            { username: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } }
          ]
        }),
        ...(role && {
          roles: { [Op.contains]: [role] }
        })
      };

      const { rows, count } = await User.findAndCountAll({
        where: whereClause,
        attributes: [
          'id', 'username', 'email', 'roles', 
          'isActive', 'lastLogin', 'createdAt'
        ],
        order: [[sortBy, sortOrder]],
        limit,
        offset: (page - 1) * limit
      });

      res.json({
        users: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { userId } = req.params;
      const { roles, isActive, email } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      // Store old values for audit
      const oldValues = {
        roles: user.roles,
        isActive: user.isActive,
        email: user.email
      };

      // Validate role changes
      if (roles) {
        const validRoles = await Role.findAll({ 
          attributes: ['name']
        });
        const validRoleNames = validRoles.map(r => r.name);
        
        const invalidRoles = roles.filter(r => !validRoleNames.includes(r));
        if (invalidRoles.length > 0) {
          return next(new Error(`Invalid roles: ${invalidRoles.join(', ')}`));
        }
      }

      // Update user
      await user.update({
        roles: roles || user.roles,
        isActive: typeof isActive === 'boolean' ? isActive : user.isActive,
        email: email || user.email
      }, { transaction });

      await logActivity(
        req.user.id,
        'UPDATE_USER',
        'User',
        userId,
        oldValues,
        { roles: user.roles, isActive: user.isActive, email: user.email },
        transaction
      );

      await transaction.commit();

      res.json({
        message: 'User updated successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async getUserDetails(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId, {
        attributes: [
          'id', 'username', 'email', 'roles', 
          'isActive', 'lastLogin', 'createdAt'
        ]
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async getRoles(req, res, next) {
    try {
      const roles = await Role.findAll({
        attributes: ['name', 'permissions']
      });

      res.json(roles);
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { roleName } = req.params;
      const { permissions } = req.body;

      const role = await Role.findOne({ 
        where: { name: roleName }
      });

      if (!role) {
        return next(new Error('Role not found'));
      }

      const oldPermissions = role.permissions;
      await role.update({ permissions }, { transaction });

      await logActivity(
        req.user.id,
        'UPDATE_ROLE_PERMISSIONS',
        'Role',
        role.id,
        { permissions: oldPermissions },
        { permissions },
        transaction
      );

      await transaction.commit();
      res.json({ 
        message: 'Role permissions updated successfully',
        role
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async getSystemStats(req, res, next) {
    try {
      const [
        userCount,
        activeUserCount,
        roleStats
      ] = await Promise.all([
        User.count(),
        User.count({ where: { isActive: true } }),
        User.findAll({
          attributes: [
            'roles',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['roles']
        })
      ]);

      res.json({
        totalUsers: userCount,
        activeUsers: activeUserCount,
        roleDistribution: roleStats
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();


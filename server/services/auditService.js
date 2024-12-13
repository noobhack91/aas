import { AuditLog, User } from '../models/index.js';
import logger from '../config/logger.js';

export const logActivity = async (
  userId,
  action,
  entityType,
  entityId = null,
  oldValues = {},
  newValues = {},
  transaction = null
) => {
  try {
    const auditLog = await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      oldValues,
      newValues
    }, { transaction });

    logger.info(`Audit log created for ${action} on ${entityType}`);
    return auditLog;
  } catch (error) {
    logger.error('Error creating audit log:', error);
    throw error;
  }
};

export const getAuditLogs = async (filters = {}) => {
  try {
    const logs = await AuditLog.findAll({
      where: filters,
      include: [{
        model: User,
        attributes: ['username', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    return logs;
  } catch (error) {
    logger.error('Error fetching audit logs:', error);
    throw error;
  }
}; 
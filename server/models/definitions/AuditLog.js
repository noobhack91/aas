import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'entity_type'
    },
    entityId: {
      type: DataTypes.UUID,
      field: 'entity_id'
    },
    oldValues: {
      type: DataTypes.JSONB,
      defaultValue: {},
      field: 'old_values'
    },
    newValues: {
      type: DataTypes.JSONB,
      defaultValue: {},
      field: 'new_values'
    }
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    underscored: true
  });

  return AuditLog;
}; 
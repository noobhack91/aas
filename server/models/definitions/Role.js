import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.ENUM(
        'admin',
        'logistics_manager',
        'installer',
        'finance_manager',
        'tender_manager'
      ),
      allowNull: false,
      unique: true
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'roles',
    timestamps: true
  });

  return Role;
}; 
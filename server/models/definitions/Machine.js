import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Machine = sequelize.define('Machine', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    specifications: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'machines',
    underscored: true,
    timestamps: true
  });

  return Machine;
}; 
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ChallanReceipt = sequelize.define('ChallanReceipt', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    consigneeId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: true,  // Change this to allow null values
    },
    createdBy: {  // Add this field  
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'challan_receipts',
    underscored: true,
    timestamps: true
  });

  return ChallanReceipt;
};
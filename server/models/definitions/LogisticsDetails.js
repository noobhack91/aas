import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const LogisticsDetails = sequelize.define('LogisticsDetails', {
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
    courierName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    docketNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    documents: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
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
    tableName: 'logistics_details',
    underscored: true,
    timestamps: true
  });

  return LogisticsDetails;
};
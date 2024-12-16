import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Consignee = sequelize.define('Consignee', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenderId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    srNo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    districtName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    blockName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    facilityName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    consignmentStatus: {
      type: DataTypes.ENUM(
        'Processing',
        'Dispatched',
        'Installation Pending',
        'Installation Done',
        'Invoice Done',
        'Bill Submitted'
      ),
      defaultValue: 'Processing'
    },
    accessoriesPending: {
      type: DataTypes.JSONB,
      defaultValue: {
        status: false,
        count: 0,
        items: []
      }
    },
    serialNumber: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'consignees',
    underscored: true,
    timestamps: true
  });

  return Consignee;
};
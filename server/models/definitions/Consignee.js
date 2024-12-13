import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Consignee = sequelize.define('Consignee', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    purchaseOrderId: {
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
    contactPersonName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactPersonEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    contactPersonMobile: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[0-9]{10}$/
      }
    },
    machineCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
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
    }
  }, {
    tableName: 'consignees',
    underscored: true,
    timestamps: true
  });

  return Consignee;
};
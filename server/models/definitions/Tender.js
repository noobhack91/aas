import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Tender = sequelize.define('Tender', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenderNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    authorityType: {
      type: DataTypes.ENUM(
        'UPMSCL', 'AUTONOMOUS', 'CMSD', 'DGME', 'AIIMS', 'SGPGI', 'KGMU', 'BHU',
        'BMSICL', 'OSMCL', 'TRADE', 'GDMC', 'AMSCL'
      ),
      allowNull: false
    },
    poDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    contractDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    leadTimeToInstall: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    leadTimeToDeliver: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    equipmentName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    remarks: {
      type: DataTypes.TEXT
    },
    hasAccessories: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasConsumables: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    selectedAccessories: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    selectedConsumables: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM(
        'Draft',
        'In Progress',
        'Partially Completed',
        'Completed'
      ),
      defaultValue: 'Draft',
      allowNull: false
    },
    accessoriesPending: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    consumablesPending: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    installationPending: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    invoicePending: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'tenders',
    underscored: true,
    timestamps: true
  });

  return Tender;
};

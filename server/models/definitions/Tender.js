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
      type: DataTypes.ENUM('UPMSCL', 'AUTONOMOUS', 'CMSD', 'DGME', 'AIIMS', 'SGPGI', 'KGMU', 'BHU',
        'BMSICL', 'OSMCL', 'TRADE', 'GDMC', 'AMSCL'),
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
    accessoriesPending: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      get() {
        // Return true if there are accessories and they haven't been delivered/installed  
        return this.getDataValue('hasAccessories') &&
          this.getDataValue('accessories')?.length > 0 &&
          this.getDataValue('status') !== 'Completed';
      }
    },
    status: {
      type: DataTypes.ENUM(
        'Draft',
        'In Progress',
        'Partially Completed',
        'Pending',
      ),
      defaultValue: 'Draft'
    },
    accessoriesPending: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    installationPending: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    invoicePending: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
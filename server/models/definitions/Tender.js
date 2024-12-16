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
      type: DataTypes.JSONB,
      defaultValue: {
        items: [],
        pending: []
      },
      get() {
        const value = this.getDataValue('selectedAccessories');
        return value ? value : { items: [], pending: [] };
      },
      set(value) {
        if (typeof value === 'string') {
          this.setDataValue('selectedAccessories', JSON.parse(value));
        } else {
          this.setDataValue('selectedAccessories', value);
        }
      }
    },
    selectedConsumables: {
      type: DataTypes.JSONB,
      defaultValue: {
        items: [],
        pending: []
      },
      get() {
        const value = this.getDataValue('selectedConsumables');
        return value ? value : { items: [], pending: [] };
      },
      set(value) {
        if (typeof value === 'string') {
          this.setDataValue('selectedConsumables', JSON.parse(value));
        } else {
          this.setDataValue('selectedConsumables', value);
        }
      }
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
      defaultValue: false
    },
    consumablesPending: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    },
    tenderStartDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    tenderEndDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    tenderDocument: {
      type: DataTypes.STRING,
      allowNull: true
    },
    loaNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    loaDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    loaDocument: {
      type: DataTypes.STRING,
      allowNull: true
    },
    poNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    poDocument: {
      type: DataTypes.STRING,
      allowNull: true
    },
    machineQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    }
  }, {
    tableName: 'tenders',
    underscored: true,
    timestamps: true
  });

  return Tender;
};

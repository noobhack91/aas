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
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    authorityType: {
      type: DataTypes.ENUM(
        'UPMSCL', 'AUTONOMOUS', 'CMSD', 'DGME', 'AIIMS', 'SGPGI', 
        'KGMU', 'BHU', 'BMSICL', 'OSMCL', 'TRADE', 'GDMC', 'AMSCL'
      ),
      allowNull: false
    },
    tenderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString()
      }
    },
    poDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfterTenderDate(value) {
          if (value < this.tenderDate) {
            throw new Error('PO date must be after tender date');
          }
        }
      }
    },
    contractDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    leadTimeToInstall: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 365
      }
    },
    leadTimeToDeliver: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 365
      }
    },
    equipmentName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    documentPath: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidPath(value) {
          if (value && !/^[\w\-\/\.]+$/.test(value)) {
            throw new Error('Invalid document path');
          }
        }
      }
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
        'Active',
        'In Progress',
        'Completed',
        'Closed'
      ),
      defaultValue: 'Draft'
    },
    progressStatus: {
      type: DataTypes.JSONB,
      defaultValue: {
        accessories: false,
        consumables: false,
        installation: false,
        invoice: false
      }
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'tenders',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['tender_number']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_by']
      }
    ],
    hooks: {
      beforeValidate: (tender) => {
        if (tender.tenderDate && tender.poDate) {
          if (tender.poDate < tender.tenderDate) {
            throw new Error('PO date cannot be before tender date');
          }
        }
      },
      afterCreate: async (tender, options) => {
        await logActivity(
          options.userId,
          'CREATE',
          'Tender',
          tender.id,
          {},
          tender.toJSON()
        );
      }
    }
  });

  Tender.prototype.updateStatus = async function() {
    const allSteps = ['accessories', 'consumables', 'installation', 'invoice'];
    const completedSteps = Object.entries(this.progressStatus)
      .filter(([_, isComplete]) => isComplete)
      .map(([step]) => step);

    if (completedSteps.length === 0) {
      this.status = 'Draft';
    } else if (completedSteps.length === allSteps.length) {
      this.status = 'Completed';
    } else {
      this.status = 'In Progress';
    }

    await this.save();
  };

  return Tender;
};

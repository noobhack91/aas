import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import defineAccessory from './definitions/Accessory.js';
import defineChallanReceipt from './definitions/ChallanReceipt.js';
import defineConsignee from './definitions/Consignee.js';
import defineConsumable from './definitions/Consumable.js';
import defineMachine from './definitions/Machine.js';
import defineInstallationReport from './definitions/InstallationReport.js';
import defineInvoice from './definitions/Invoice.js';
import defineLogisticsDetails from './definitions/LogisticsDetails.js';
import defineTender from './definitions/Tender.js';
import defineUser from './definitions/User.js';

dotenv.config();

// Initialize Sequelize with database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || "equipment_management",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "admin",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
);

// Initialize models
const User = defineUser(sequelize);
const Tender = defineTender(sequelize);
const Consignee = defineConsignee(sequelize);
const LogisticsDetails = defineLogisticsDetails(sequelize);
const ChallanReceipt = defineChallanReceipt(sequelize);
const InstallationReport = defineInstallationReport(sequelize);
const Invoice = defineInvoice(sequelize);
const Accessory = defineAccessory(sequelize);
const Consumable = defineConsumable(sequelize);
const Machine = defineMachine(sequelize);

// Define associations
const defineAssociations = () => {
  // Tender associations
  Tender.hasMany(Consignee, {
    foreignKey: 'tenderId',
    as: 'consignees'
  });

  Tender.belongsToMany(Machine, {
    through: 'tender_machines',
    foreignKey: 'tender_id',
    otherKey: 'machine_id',
    as: 'machines'
  });

  // Consignee associations
  Consignee.belongsTo(Tender, {
    foreignKey: 'tenderId'
  });

  Consignee.hasOne(LogisticsDetails, {
    foreignKey: 'consigneeId',
    as: 'logisticsDetails'
  });

  Consignee.hasOne(ChallanReceipt, {
    foreignKey: 'consigneeId',
    as: 'challanReceipt'
  });

  Consignee.hasOne(InstallationReport, {
    foreignKey: 'consigneeId',
    as: 'installationReport'
  });

  Consignee.hasOne(Invoice, {
    foreignKey: 'consigneeId',
    as: 'invoice'
  });

  // Machine associations
  Machine.belongsToMany(Tender, {
    through: 'tender_machines',
    foreignKey: 'machine_id',
    otherKey: 'tender_id',
    as: 'tenders'
  });

  // Document associations
  LogisticsDetails.belongsTo(Consignee, {
    foreignKey: 'consigneeId'
  });

  ChallanReceipt.belongsTo(Consignee, {
    foreignKey: 'consigneeId'
  });

  InstallationReport.belongsTo(Consignee, {
    foreignKey: 'consigneeId'
  });

  Invoice.belongsTo(Consignee, {
    foreignKey: 'consigneeId'
  });

  // User associations (for tracking who created records)
  Tender.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  LogisticsDetails.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  ChallanReceipt.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  InstallationReport.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  Invoice.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
};

// Initialize associations
defineAssociations();

// Export all models and sequelize instance
export {
  User,
  Tender,
  Consignee,
  LogisticsDetails,
  ChallanReceipt,
  InstallationReport,
  Invoice,
  Accessory,
  Consumable,
  Machine,
  sequelize
};

const models = {
  User,
  Tender,
  Consignee,
  LogisticsDetails,
  ChallanReceipt,
  InstallationReport,
  Invoice,
  Accessory,
  Consumable,
  Machine
};

export default models;

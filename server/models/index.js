import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import defineUser from './definitions/User.js';
import defineRole from './definitions/Role.js';
import defineTender from './definitions/Tender.js';
import defineConsignee from './definitions/Consignee.js';
import defineLogisticsDetails from './definitions/LogisticsDetails.js';
import defineChallanReceipt from './definitions/ChallanReceipt.js';
import defineInstallationReport from './definitions/InstallationReport.js';
import defineInvoice from './definitions/Invoice.js';
import defineAuditLog from './definitions/AuditLog.js';
import defineLOA from './definitions/LOA.js';
import definePurchaseOrder from './definitions/PurchaseOrder.js';
import defineAccessory from './definitions/Accessory.js';
import defineConsumable from './definitions/Consumable.js';
import defineMachine from './definitions/Machine.js';
import EquipmentInstallation from './definitions/EquipmentInstallation.js';
import EquipmentLocation from './definitions/EquipmentLocation.js';
dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  dialectOptions: process.env.NODE_ENV === 'production' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {},

  logging: false,
  pool: {
    max: parseInt(process.env.DB_MAX_POOL) || 20,
    min: 0,
    acquire: 30000,
    idle: parseInt(process.env.DB_IDLE_TIMEOUT) || 10000
  }
});

// Define models
const User = defineUser(sequelize);
const Role = defineRole(sequelize);
const Tender = defineTender(sequelize);
const Consignee = defineConsignee(sequelize);
const LogisticsDetails = defineLogisticsDetails(sequelize);
const ChallanReceipt = defineChallanReceipt(sequelize);
const InstallationReport = defineInstallationReport(sequelize);
const Invoice = defineInvoice(sequelize);
const AuditLog = defineAuditLog(sequelize);
const LOA = defineLOA(sequelize);
const PurchaseOrder = definePurchaseOrder(sequelize);
const Accessory = defineAccessory(sequelize);
const Consumable = defineConsumable(sequelize);
const Machine = defineMachine(sequelize);

// Define associations

// Tender associations
Tender.hasMany(Consignee, { foreignKey: 'tenderId', onDelete: 'CASCADE' });
Tender.hasOne(LOA, { foreignKey: 'tenderId', onDelete: 'CASCADE' });
Tender.hasOne(PurchaseOrder, { foreignKey: 'tenderId', onDelete: 'CASCADE' });
Tender.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Tender.belongsTo(Machine, { foreignKey: 'machineId' });

// Consignee associations
Consignee.belongsTo(Tender, { foreignKey: 'tenderId' });
Consignee.hasMany(LogisticsDetails, { foreignKey: 'consigneeId', onDelete: 'CASCADE' });
Consignee.hasMany(ChallanReceipt, { foreignKey: 'consigneeId', onDelete: 'CASCADE' });
Consignee.hasMany(InstallationReport, { foreignKey: 'consigneeId', onDelete: 'CASCADE' });
Consignee.hasMany(Invoice, { foreignKey: 'consigneeId', onDelete: 'CASCADE' });

// Document associations
LogisticsDetails.belongsTo(Consignee, { foreignKey: 'consigneeId' });
LogisticsDetails.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

ChallanReceipt.belongsTo(Consignee, { foreignKey: 'consigneeId' });
ChallanReceipt.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

InstallationReport.belongsTo(Consignee, { foreignKey: 'consigneeId' });
InstallationReport.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Invoice.belongsTo(Consignee, { foreignKey: 'consigneeId' });
Invoice.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// LOA and PO associations
LOA.belongsTo(Tender, { foreignKey: 'tenderId' });
LOA.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

PurchaseOrder.belongsTo(Tender, { foreignKey: 'tenderId' });
PurchaseOrder.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Audit Log associations
AuditLog.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(AuditLog, { foreignKey: 'user_id' });

// Machine associations
Machine.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Tender.belongsTo(Machine, { foreignKey: 'machineId' });

// Export all models
const models = {
  User,
  Role,
  Tender,
  Consignee,
  LogisticsDetails,
  ChallanReceipt,
  InstallationReport,
  Invoice,
  AuditLog,
  LOA,
  PurchaseOrder,
  Accessory,
  Consumable,
  Machine
};

// Named exports for individual models
export {
  sequelize,
  User,
  Role,
  Tender,
  Consignee,
  LogisticsDetails,
  ChallanReceipt,
  InstallationReport,
  EquipmentInstallation,
  EquipmentLocation,
  Invoice,
  AuditLog,
  LOA,
  PurchaseOrder,
  Accessory,
  Consumable,
  Machine
};

// Default export for all models
export default models;

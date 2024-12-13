import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import logger from '../config/logger.js';
import { 
  Accessory,
  AuditLog,
  Consignee, 
  Consumable,
  LOA,
  Machine,
  PurchaseOrder,
  Role,
  sequelize, 
  Tender, 
  User 
} from '../models/index.js';

class DatabaseController {
  async initializeDatabase(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      // Drop and recreate all tables
      await sequelize.sync({ force: true });
      logger.info('Database tables recreated successfully');

      // Create default roles
      const roles = await this.createDefaultRoles(transaction);
      logger.info('Default roles created successfully');

      // Create default admin user
      const adminUser = await this.createAdminUser(transaction);
      logger.info('Admin user created successfully');

      // Create sample data if in development
      if (process.env.NODE_ENV === 'development') {
        await this.createSampleData(transaction, adminUser.id);
        logger.info('Sample data created successfully');
      }

      await transaction.commit();

      res.json({
        message: 'Database initialized successfully',
        roles: roles.map(r => r.name),
        adminUser: {
          username: adminUser.username,
          email: adminUser.email
        }
      });
    } catch (error) {
      await transaction.rollback();
      logger.error('Database initialization failed:', error);
      next(error);
    }
  }

  async createDefaultRoles(transaction) {
    const roleDefinitions = [
      {
        name: 'Admin',
        permissions: {
          users: ['create', 'read', 'update', 'delete'],
          roles: ['create', 'read', 'update', 'delete'],
          tenders: ['create', 'read', 'update', 'delete'],
          items: ['create', 'read', 'update', 'delete']
        }
      },
      {
        name: 'Tender Manager',
        permissions: {
          tenders: ['create', 'read', 'update'],
          items: ['read']
        }
      },
      {
        name: 'Logistics Manager',
        permissions: {
          tenders: ['read'],
          consignees: ['read', 'update'],
          logistics: ['create', 'read', 'update']
        }
      },
      {
        name: 'Installer',
        permissions: {
          tenders: ['read'],
          consignees: ['read'],
          installation: ['create', 'read', 'update']
        }
      },
      {
        name: 'Finance Manager',
        permissions: {
          tenders: ['read'],
          invoices: ['create', 'read', 'update']
        }
      },
      {
        name: 'Viewer',
        permissions: {
          tenders: ['read'],
          consignees: ['read'],
          items: ['read']
        }
      }
    ];

    return await Role.bulkCreate(roleDefinitions, { transaction });
  }

  async createAdminUser(transaction) {
    const password = await bcrypt.hash(
      process.env.DEFAULT_ADMIN_PASSWORD || 'admin123', 
      10
    );

    return await User.create({
      username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
      password,
      roles: ['Admin'],
      isActive: true
    }, { transaction });
  }

  async createSampleData(transaction, adminUserId) {
    // Create sample machines
    const machines = await Machine.bulkCreate([
      {
        name: 'Machine Type A',
        code: 'MTA-001',
        specifications: {
          power: '220V',
          weight: '100kg',
          dimensions: '100x50x75cm'
        },
        createdBy: adminUserId
      },
      {
        name: 'Machine Type B',
        code: 'MTB-001',
        specifications: {
          power: '110V',
          weight: '75kg',
          dimensions: '80x40x60cm'
        },
        createdBy: adminUserId
      }
    ], { transaction });

    // Create sample accessories
    const accessories = await Accessory.bulkCreate([
      {
        name: 'Power Cable',
        code: 'ACC-001',
        specifications: { length: '2m' },
        createdBy: adminUserId
      },
      {
        name: 'Data Cable',
        code: 'ACC-002',
        specifications: { length: '3m' },
        createdBy: adminUserId
      }
    ], { transaction });

    // Create sample consumables
    const consumables = await Consumable.bulkCreate([
      {
        name: 'Test Strips',
        code: 'CON-001',
        specifications: { quantity: '100/box' },
        createdBy: adminUserId
      },
      {
        name: 'Reagent',
        code: 'CON-002',
        specifications: { volume: '500ml' },
        createdBy: adminUserId
      }
    ], { transaction });

    // Create sample tender
    const tender = await Tender.create({
      tenderNumber: 'TENDER-2024-001',
      authorityType: 'UPMSCL',
      tenderDate: new Date(),
      poDate: new Date(),
      contractDate: new Date(),
      equipmentName: 'Medical Equipment A',
      description: 'Sample tender for testing',
      leadTimeToDeliver: 30,
      leadTimeToInstall: 15,
      hasAccessories: true,
      hasConsumables: true,
      createdBy: adminUserId
    }, { transaction });

    // Create sample LOA
    const loa = await LOA.create({
      tenderId: tender.id,
      loaNumber: 'LOA-2024-001',
      loaDate: new Date(),
      status: 'Active',
      createdBy: adminUserId
    }, { transaction });

    // Create sample Purchase Order
    await PurchaseOrder.create({
      loaId: loa.id,
      machineId: machines[0].id,
      poNumber: 'PO-2024-001',
      poDate: new Date(),
      status: 'Active',
      createdBy: adminUserId
    }, { transaction });

    // Associate accessories and consumables with tender
    await tender.addAccessoryItems(accessories, { transaction });
    await tender.addConsumableItems(consumables, { transaction });

    return {
      machines,
      accessories,
      consumables,
      tender,
      loa
    };
  }

  async getDatabaseStats(req, res, next) {
    try {
      const [
        userCount,
        tenderCount,
        consigneeCount,
        accessoryCount,
        consumableCount,
        auditLogCount
      ] = await Promise.all([
        User.count(),
        Tender.count(),
        Consignee.count(),
        Accessory.count(),
        Consumable.count(),
        AuditLog.count()
      ]);

      const recentActivity = await AuditLog.findAll({
        attributes: ['action', 'entityType', 'createdAt'],
        include: [{
          model: User,
          attributes: ['username']
        }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      res.json({
        counts: {
          users: userCount,
          tenders: tenderCount,
          consignees: consigneeCount,
          accessories: accessoryCount,
          consumables: consumableCount,
          auditLogs: auditLogCount
        },
        recentActivity
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DatabaseController();
// server/controllers/itemsController.js  
import { Op } from 'sequelize';
import logger from '../config/logger.js';
import { Accessory, Consumable, Tender, sequelize } from '../models/index.js';
import { logActivity } from '../services/auditService.js';

class ItemsController {
  async getAccessories(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const whereClause = {
        ...(search && {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { code: { [Op.iLike]: `%${search}%` } }
          ]
        }),
        ...(typeof isActive === 'boolean' && { isActive })
      };

      const { rows, count } = await Accessory.findAndCountAll({
        where: whereClause,
        include: [{
          model: Tender,
          as: 'accessoryTenders',
          attributes: ['id', 'tenderNumber'],
          through: { attributes: [] }
        }],
        order: [[sortBy, sortOrder]],
        limit,
        offset: (page - 1) * limit
      });

      res.json({
        accessories: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      next(error);
    }
  }

  async createAccessory(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { name, code, description, specifications } = req.body;

      const accessory = await Accessory.create({
        name,
        code,
        description,
        specifications,
        isActive: true,
        createdBy: req.user.id
      }, { transaction });

      await logActivity(
        req.user.id,
        'CREATE_ACCESSORY',
        'Accessory',
        accessory.id,
        {},
        accessory.toJSON(),
        transaction
      );

      await transaction.commit();
      res.status(201).json(accessory);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async updateAccessory(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { name, code, description, specifications, isActive } = req.body;

      const accessory = await Accessory.findByPk(id);
      if (!accessory) {
        return next(new Error('Accessory not found'));
      }

      const oldValues = accessory.toJSON();
      await accessory.update({
        name,
        code,
        description,
        specifications,
        isActive: typeof isActive === 'boolean' ? isActive : accessory.isActive
      }, { transaction });

      await logActivity(
        req.user.id,
        'UPDATE_ACCESSORY',
        'Accessory',
        id,
        oldValues,
        accessory.toJSON(),
        transaction
      );

      await transaction.commit();
      res.json(accessory);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async getConsumables(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const whereClause = {
        ...(search && {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { code: { [Op.iLike]: `%${search}%` } }
          ]
        }),
        ...(typeof isActive === 'boolean' && { isActive })
      };

      const { rows, count } = await Consumable.findAndCountAll({
        where: whereClause,
        include: [{
          model: Tender,
          as: 'consumableTenders',
          attributes: ['id', 'tenderNumber'],
          through: { attributes: [] }
        }],
        order: [[sortBy, sortOrder]],
        limit,
        offset: (page - 1) * limit
      });

      res.json({
        consumables: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      next(error);
    }
  }

  async createConsumable(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { name, code, description, specifications } = req.body;

      const consumable = await Consumable.create({
        name,
        code,
        description,
        specifications,
        isActive: true,
        createdBy: req.user.id
      }, { transaction });

      await logActivity(
        req.user.id,
        'CREATE_CONSUMABLE',
        'Consumable',
        consumable.id,
        {},
        consumable.toJSON(),
        transaction
      );

      await transaction.commit();
      res.status(201).json(consumable);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async updateConsumable(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { name, code, description, specifications, isActive } = req.body;

      const consumable = await Consumable.findByPk(id);
      if (!consumable) {
        return next(new Error('Consumable not found'));
      }

      const oldValues = consumable.toJSON();
      await consumable.update({
        name,
        code,
        description,
        specifications,
        isActive: typeof isActive === 'boolean' ? isActive : consumable.isActive
      }, { transaction });

      await logActivity(
        req.user.id,
        'UPDATE_CONSUMABLE',
        'Consumable',
        id,
        oldValues,
        consumable.toJSON(),
        transaction
      );

      await transaction.commit();
      res.json(consumable);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async getItemStats(req, res, next) {
    try {
      const [
        accessoryStats,
        consumableStats,
        tenderUsage
      ] = await Promise.all([
        Accessory.findAll({
          attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
            [sequelize.fn('SUM', 
              sequelize.literal("CASE WHEN \"isActive\" THEN 1 ELSE 0 END")
            ), 'active']
          ]
        }),
        Consumable.findAll({
          attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
            [sequelize.fn('SUM', 
              sequelize.literal("CASE WHEN \"isActive\" THEN 1 ELSE 0 END")
            ), 'active']
          ]
        }),
        Tender.findAll({
          attributes: [
            'id', 'tenderNumber',
            [sequelize.fn('COUNT', sequelize.col('accessories.id')), 'accessoryCount'],
            [sequelize.fn('COUNT', sequelize.col('consumables.id')), 'consumableCount']
          ],
          include: [
            {
              model: Accessory,
              as: 'accessoryItems',
              attributes: [],
              through: { attributes: [] }
            },
            {
              model: Consumable,
              as: 'consumableItems',
              attributes: [],
              through: { attributes: [] }
            }
          ],
          group: ['Tender.id', 'Tender.tenderNumber'],
          limit: 5,
          order: [[sequelize.literal('accessoryCount + consumableCount'), 'DESC']]
        })
      ]);

      res.json({
        accessories: accessoryStats[0],
        consumables: consumableStats[0],
        topTendersByItems: tenderUsage
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ItemsController();  
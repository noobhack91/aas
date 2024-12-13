import { Parser } from 'json2csv';
import { Op } from 'sequelize';
import logger from '../config/logger.js';
import { 
  Consignee, 
  LOA, 
  PurchaseOrder, 
  sequelize, 
  Tender 
} from '../models/index.js';
import { logActivity } from '../services/auditService.js';

class TenderController {
  async searchTenders(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        status,
        startDate,
        endDate 
      } = req.query;

      const whereClause = {
        ...(search && {
          [Op.or]: [
            { tenderNumber: { [Op.iLike]: `%${search}%` } },
            { equipmentName: { [Op.iLike]: `%${search}%` } }
          ]
        }),
        ...(status && { status }),
        ...(startDate && endDate && {
          tenderDate: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        })
      };

      const { rows, count } = await Tender.findAndCountAll({
        where: whereClause,
        include: [{
          model: Consignee,
          as: 'consignees',
          attributes: ['consignmentStatus']
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset: (page - 1) * limit,
        distinct: true
      });

      res.json({
        tenders: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      next(error);
    }
  }

  async getTenderById(req, res, next) {
    try {
      const { id } = req.params;

      const tender = await Tender.findByPk(id, {
        include: [{
          model: Consignee,
          as: 'consignees',
          include: ['logisticsDetails', 'challanReceipt', 'installationReport', 'invoice']
        }]
      });

      if (!tender) {
        return next(new Error('Tender not found'));
      }

      res.json(tender);
    } catch (error) {
      next(error);
    }
  }

  async createTender(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const tenderData = {
        ...req.body,
        createdBy: req.user.id
      };

      const tender = await Tender.create(tenderData, { transaction });

      await logActivity(
        req.user.id,
        'CREATE_TENDER',
        'Tender',
        tender.id,
        {},
        tender.toJSON(),
        transaction
      );

      await transaction.commit();
      res.status(201).json(tender);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async updateTender(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const updateData = req.body;

      const tender = await Tender.findByPk(id);
      if (!tender) {
        return next(new Error('Tender not found'));
      }

      const oldValues = tender.toJSON();
      await tender.update(updateData, { transaction });

      await logActivity(
        req.user.id,
        'UPDATE_TENDER',
        'Tender',
        id,
        oldValues,
        tender.toJSON(),
        transaction
      );

      await transaction.commit();
      res.json(tender);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async deleteTender(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;

      const tender = await Tender.findByPk(id);
      if (!tender) {
        return next(new Error('Tender not found'));
      }

      // Check if tender can be deleted
      const hasActiveConsignees = await Consignee.count({
        where: {
          tenderId: id,
          consignmentStatus: {
            [Op.notIn]: ['Draft', 'Cancelled']
          }
        }
      });

      if (hasActiveConsignees) {
        return next(new Error('Cannot delete tender with active consignees'));
      }

      await tender.destroy({ transaction });

      await logActivity(
        req.user.id,
        'DELETE_TENDER',
        'Tender',
        id,
        tender.toJSON(),
        {},
        transaction
      );

      await transaction.commit();
      res.json({ message: 'Tender deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async getDistricts(req, res, next) {
    try {
      const districts = await Consignee.findAll({
        attributes: [
          [sequelize.fn('DISTINCT', sequelize.col('districtName')), 'district']
        ],
        where: {
          districtName: {
            [Op.not]: null
          }
        },
        order: [['districtName', 'ASC']]
      });

      res.json(districts.map(d => d.get('district')));
    } catch (error) {
      next(error);
    }
  }

  async getBlocks(req, res, next) {
    try {
      const { district } = req.query;

      const whereClause = {
        blockName: {
          [Op.not]: null
        },
        ...(district && { districtName: district })
      };

      const blocks = await Consignee.findAll({
        attributes: [
          [sequelize.fn('DISTINCT', sequelize.col('blockName')), 'block']
        ],
        where: whereClause,
        order: [['blockName', 'ASC']]
      });

      res.json(blocks.map(b => b.get('block')));
    } catch (error) {
      next(error);
    }
  }

  async exportTenderData(req, res, next) {
    try {
      const { tenderId } = req.params;
      const { format = 'csv' } = req.query;

      const tender = await Tender.findByPk(tenderId, {
        include: [{
          model: Consignee,
          as: 'consignees',
          include: ['logisticsDetails', 'challanReceipt', 'installationReport']
        }]
      });

      if (!tender) {
        return next(new Error('Tender not found'));
      }

      if (format === 'csv') {
        const parser = new Parser();
        const csv = parser.parse(tender.consignees);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=tender_${tenderId}.csv`);
        res.send(csv);
      } else {
        res.json(tender);
      }
    } catch (error) {
      next(error);
    }
  }

  async getTenderStats(req, res, next) {
    try {
      const [
        statusStats,
        consigneeStats,
        monthlyStats
      ] = await Promise.all([
        Tender.findAll({
          attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['status']
        }),
        Consignee.findAll({
          attributes: [
            'consignmentStatus',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['consignmentStatus']
        }),
        Tender.findAll({
          attributes: [
            [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'month'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt'))],
          order: [[sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'DESC']],
          limit: 12
        })
      ]);

      res.json({
        byStatus: statusStats,
        byConsigneeStatus: consigneeStats,
        monthlyTrend: monthlyStats
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TenderController();  
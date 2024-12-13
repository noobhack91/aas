import { Op } from 'sequelize';
import logger from '../config/logger.js';
import { 
  ChallanReceipt, 
  Consignee, 
  InstallationReport, 
  Invoice, 
  LogisticsDetails,
  PurchaseOrder,
  sequelize 
} from '../models/index.js';
import { logActivity } from '../services/auditService.js';
import { updateTenderStatus } from '../utils/tenderStatus.js';

class ConsigneeController {
  async getConsignees(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        districts, 
        status,
        search,
        tenderId,
        purchaseOrderId 
      } = req.query;

      const whereClause = {
        ...(districts && { districtName: districts.split(',') }),
        ...(status && { consignmentStatus: status }),
        ...(tenderId && { tenderId }),
        ...(purchaseOrderId && { purchaseOrderId }),
        ...(search && {
          [Op.or]: [
            { districtName: { [Op.iLike]: `%${search}%` } },
            { blockName: { [Op.iLike]: `%${search}%` } },
            { facilityName: { [Op.iLike]: `%${search}%` } }
          ]
        })
      };

      const { rows, count } = await Consignee.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: LogisticsDetails, 
            as: 'logisticsDetails',
            required: false 
          },
          { 
            model: ChallanReceipt, 
            as: 'challanReceipt',
            required: false 
          },
          { 
            model: InstallationReport, 
            as: 'installationReport',
            required: false 
          },
          { 
            model: Invoice, 
            as: 'invoice',
            required: false 
          },
          {
            model: PurchaseOrder,
            attributes: ['poNumber', 'poDate']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset: (page - 1) * limit
      });

      res.json({
        consignees: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      next(error);
    }
  }

  async getConsigneeDetails(req, res, next) {
    try {
      const { id } = req.params;

      const consignee = await Consignee.findByPk(id, {
        include: [
          {
            model: LogisticsDetails,
            as: 'logisticsDetails',
            attributes: ['date', 'courierName', 'docketNumber', 'documents']
          },
          {
            model: ChallanReceipt,
            as: 'challanReceipt',
            attributes: ['date', 'filePath']
          },
          {
            model: InstallationReport,
            as: 'installationReport',
            attributes: ['date', 'filePath']
          },
          {
            model: Invoice,
            as: 'invoice',
            attributes: ['date', 'filePath']
          },
          {
            model: PurchaseOrder,
            attributes: ['poNumber', 'poDate', 'status']
          }
        ]
      });

      if (!consignee) {
        return next(new Error('Consignee not found'));
      }

      res.json(consignee);
    } catch (error) {
      next(error);
    }
  }

  async updateAccessoriesStatus(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { accessoryUpdates } = req.body;

      const consignee = await Consignee.findByPk(id);
      if (!consignee) {
        return next(new Error('Consignee not found'));
      }

      const oldAccessories = consignee.accessoriesPending;
      const updatedItems = oldAccessories.items.filter(
        item => !accessoryUpdates.includes(item)
      );

      const updatedAccessories = {
        status: updatedItems.length > 0,
        count: updatedItems.length,
        items: updatedItems
      };

      await consignee.update(
        { accessoriesPending: updatedAccessories },
        { transaction }
      );

      await logActivity(
        req.user.id,
        'UPDATE_ACCESSORIES',
        'Consignee',
        id,
        { accessoriesPending: oldAccessories },
        { accessoriesPending: updatedAccessories },
        transaction
      );

      await updateTenderStatus(consignee.tenderId, transaction);
      await transaction.commit();

      res.json({
        message: 'Accessories status updated successfully',
        consignee: await Consignee.findByPk(id)
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async updateConsignmentStatus(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { status, remarks } = req.body;

      const consignee = await Consignee.findByPk(id);
      if (!consignee) {
        return next(new Error('Consignee not found'));
      }

      const oldValues = {
        status: consignee.consignmentStatus,
        remarks: consignee.remarks
      };

      await consignee.update({
        consignmentStatus: status,
        remarks,
        updatedBy: req.user.id
      }, { transaction });

      await logActivity(
        req.user.id,
        'UPDATE_CONSIGNMENT_STATUS',
        'Consignee',
        id,
        oldValues,
        { status, remarks },
        transaction
      );

      await updateTenderStatus(consignee.tenderId, transaction);
      await transaction.commit();

      res.json({
        message: 'Consignment status updated successfully',
        consignee: await Consignee.findByPk(id)
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
}

export default new ConsigneeController();  
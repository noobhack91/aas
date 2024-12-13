import { LOA, PurchaseOrder, sequelize } from '../models/index.js';
import logger from '../config/logger.js';
import azureStorage, { containers } from '../utils/azureStorage.js';
import { logActivity } from '../services/auditService.js';

class DocumentController {
  async uploadLOA(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { tenderId, date } = req.body;
      
      if (!req.file) {
        return next(new Error('File is required'));
      }

      // Upload to Azure
      const uploadResult = await azureStorage.uploadFile(
        req.file, 
        containers.LOAS
      );

      // Create LOA record
      const loa = await LOA.create({
        tenderId,
        date: new Date(date),
        filePath: uploadResult.url,
        createdBy: req.user.id
      }, { transaction });

      await logActivity(
        req.user.id,
        'UPLOAD_LOA',
        'LOA',
        loa.id,
        {},
        loa.toJSON(),
        transaction
      );

      await transaction.commit();
      res.status(201).json(loa);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async uploadPO(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { tenderId, date, number } = req.body;
      
      if (!req.file) {
        return next(new Error('File is required'));
      }

      // Upload to Azure
      const uploadResult = await azureStorage.uploadFile(
        req.file, 
        containers.PO
      );

      // Create PO record
      const po = await PurchaseOrder.create({
        tenderId,
        number,
        date: new Date(date),
        filePath: uploadResult.url,
        createdBy: req.user.id
      }, { transaction });

      await logActivity(
        req.user.id,
        'UPLOAD_PO',
        'PurchaseOrder',
        po.id,
        {},
        po.toJSON(),
        transaction
      );

      await transaction.commit();
      res.status(201).json(po);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async getLOA(req, res, next) {
    try {
      const { tenderId } = req.params;
      const loa = await LOA.findOne({ where: { tenderId } });
      res.json(loa);
    } catch (error) {
      next(error);
    }
  }

  async getPO(req, res, next) {
    try {
      const { tenderId } = req.params;
      const po = await PurchaseOrder.findOne({ where: { tenderId } });
      res.json(po);
    } catch (error) {
      next(error);
    }
  }
}

export default new DocumentController(); 
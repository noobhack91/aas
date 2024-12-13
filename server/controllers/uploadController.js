import { Op } from 'sequelize';
import logger from '../config/logger.js';
import { 
  ChallanReceipt, 
  Consignee, 
  InstallationReport, 
  Invoice, 
  LogisticsDetails, 
  sequelize 
} from '../models/index.js';
import { logActivity } from '../services/auditService.js';
import azureStorage, { containers } from '../utils/azureStorage.js';
import { updateTenderStatus } from '../utils/tenderStatus.js';

class UploadController {
  async uploadLogistics(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { consigneeId, date, courierName, docketNumber } = req.body;

      const consignee = await Consignee.findByPk(consigneeId);
      if (!consignee) {
        return next(new Error('Consignee not found'));
      }

      const fileUrls = [];
      if (req.files?.length) {
        for (const file of req.files) {
          const uploadResult = await azureStorage.uploadFile(file, containers.LOGISTICS);
          fileUrls.push(uploadResult.url);
        }
      }

      const logistics = await LogisticsDetails.create({
        consigneeId,
        date: new Date(date),
        courierName,
        docketNumber,
        documents: fileUrls,
        createdBy: req.user.id
      }, { transaction });

      await logActivity(
        req.user.id,
        'UPLOAD_LOGISTICS',
        'LogisticsDetails',
        logistics.id,
        {},
        logistics.toJSON(),
        transaction
      );

      await updateTenderStatus(consignee.tenderId, transaction);
      await transaction.commit();

      res.status(201).json(logistics);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async uploadChallan(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { consigneeId, date } = req.body;

      const consignee = await Consignee.findByPk(consigneeId);
      if (!consignee) {
        return next(new Error('Consignee not found'));
      }

      let fileUrl = null;
      if (req.file) {
        const uploadResult = await azureStorage.uploadFile(req.file, containers.CHALLAN);
        fileUrl = uploadResult.url;
      }

      const challan = await ChallanReceipt.create({
        consigneeId,
        date: new Date(date),
        filePath: fileUrl,
        createdBy: req.user.id
      }, { transaction });

      await logActivity(
        req.user.id,
        'UPLOAD_CHALLAN',
        'ChallanReceipt',
        challan.id,
        {},
        challan.toJSON(),
        transaction
      );

      await updateTenderStatus(consignee.tenderId, transaction);
      await transaction.commit();

      res.status(201).json(challan);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async uploadInstallation(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { consigneeId, date } = req.body;

      const consignee = await Consignee.findByPk(consigneeId);
      if (!consignee) {
        return next(new Error('Consignee not found'));
      }

      let fileUrl = null;
      if (req.file) {
        const uploadResult = await azureStorage.uploadFile(req.file, containers.INSTALLATION);
        fileUrl = uploadResult.url;
      }

      const installation = await InstallationReport.create({
        consigneeId,
        date: new Date(date),
        filePath: fileUrl,
        createdBy: req.user.id
      }, { transaction });

      await logActivity(
        req.user.id,
        'UPLOAD_INSTALLATION',
        'InstallationReport',
        installation.id,
        {},
        installation.toJSON(),
        transaction
      );

      await updateTenderStatus(consignee.tenderId, transaction);
      await transaction.commit();

      res.status(201).json(installation);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async uploadInvoice(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { consigneeId, date, amount } = req.body;

      const consignee = await Consignee.findByPk(consigneeId);
      if (!consignee) {
        return next(new Error('Consignee not found'));
      }

      let fileUrl = null;
      if (req.file) {
        const uploadResult = await azureStorage.uploadFile(req.file, containers.INVOICE);
        fileUrl = uploadResult.url;
      }

      const invoice = await Invoice.create({
        consigneeId,
        date: new Date(date),
        amount: parseFloat(amount),
        filePath: fileUrl,
        createdBy: req.user.id
      }, { transaction });

      await logActivity(
        req.user.id,
        'UPLOAD_INVOICE',
        'Invoice',
        invoice.id,
        {},
        invoice.toJSON(),
        transaction
      );

      await updateTenderStatus(consignee.tenderId, transaction);
      await transaction.commit();

      res.status(201).json(invoice);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async deleteFile(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { url, type } = req.query;
      if (!url || !type) {
        return next(new Error('URL and type are required'));
      }

      // Determine container and model based on type
      let container, model, field;
      switch (type.toLowerCase()) {
        case 'logistics':
          container = containers.LOGISTICS;
          model = LogisticsDetails;
          field = 'documents';
          break;
        case 'challan':
          container = containers.CHALLAN;
          model = ChallanReceipt;
          field = 'filePath';
          break;
        case 'installation':
          container = containers.INSTALLATION;
          model = InstallationReport;
          field = 'filePath';
          break;
        case 'invoice':
          container = containers.INVOICE;
          model = Invoice;
          field = 'filePath';
          break;
        default:
          return next(new Error('Invalid file type'));
      }

      // Delete from Azure storage
      await azureStorage.deleteFile(url);

      // Update database
      if (field === 'documents') {
        await model.update(
          { 
            documents: sequelize.fn('array_remove', sequelize.col('documents'), url)
          },
          { 
            where: { documents: { [Op.contains]: [url] } },
            transaction 
          }
        );
      } else {
        await model.update(
          { [field]: null },
          { 
            where: { [field]: url },
            transaction 
          }
        );
      }

      await logActivity(
        req.user.id,
        'DELETE_FILE',
        type.toUpperCase(),
        null,
        { url },
        {},
        transaction
      );

      await transaction.commit();
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
}

export default new UploadController();

import { Op } from 'sequelize'; // Add this import at the top of your file
import logger from '../config/logger.js';
import { ChallanReceipt, Consignee, InstallationReport, Invoice, LogisticsDetails, sequelize } from '../models/index.js';
import { containers, deleteAzureFile, uploadFile } from '../utils/azureStorage.js';
import { updateTenderStatus } from '../utils/tenderStatus.js';

export const uploadLogistics = async (req, res) => {
  try {
    const { consigneeId, date, courierName, docketNumber } = req.body;

    const consignee = await Consignee.findByPk(consigneeId);
    if (!consignee) {
      return res.status(404).json({ error: 'Consignee not found' });
    }

    const fileUrls = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const fileUrl = await uploadFile(file, containers.LOGISTICS);
        fileUrls.push(fileUrl);
      }
    }

    const logistics = await LogisticsDetails.create({
      consigneeId,
      date: new Date(date),
      courierName,
      docketNumber,
      documents: fileUrls,
      createdBy: req.user.id
    });

    await consignee.update({ consignmentStatus: 'Dispatched' });
    await updateTenderStatus(consignee.tenderId);

    res.status(201).json(logistics);
  } catch (error) {
    logger.error('Error uploading logistics details:', error);
    res.status(400).json({ error: error.message });
  }
};

export const uploadChallan = async (req, res) => {
  try {
    const { consigneeId, date } = req.body;

    const consignee = await Consignee.findByPk(consigneeId);
    if (!consignee) {
      return res.status(404).json({ error: 'Consignee not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const fileUrl = await uploadFile(req.file, containers.CHALLAN);

    const challan = await ChallanReceipt.create({
      consigneeId,
      date: new Date(date),
      filePath: fileUrl,
      createdBy: req.user.id
    });

    await consignee.update({ consignmentStatus: 'Installation Pending' });
    await updateTenderStatus(consignee.tenderId);

    res.status(201).json(challan);
  } catch (error) {
    logger.error('Error uploading challan receipt:', error);
    res.status(400).json({ error: error.message });
  }
};

export const uploadInstallation = async (req, res) => {
  try {
    const { consigneeId, date } = req.body;

    const consignee = await Consignee.findByPk(consigneeId);
    if (!consignee) {
      return res.status(404).json({ error: 'Consignee not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const fileUrl = await uploadFile(req.file, containers.INSTALLATION);

    const installation = await InstallationReport.create({
      consigneeId,
      date: new Date(date),
      filePath: fileUrl,
      createdBy: req.user.id
    });

    await consignee.update({ consignmentStatus: 'Installation Done' });
    await updateTenderStatus(consignee.tenderId);

    res.status(201).json(installation);
  } catch (error) {
    logger.error('Error uploading installation report:', error);
    res.status(400).json({ error: error.message });
  }
};

export const uploadInvoice = async (req, res) => {
  try {
    const { consigneeId, date } = req.body;

    const consignee = await Consignee.findByPk(consigneeId);
    if (!consignee) {
      return res.status(404).json({ error: 'Consignee not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const fileUrl = await uploadFile(req.file, containers.INVOICE);

    const invoice = await Invoice.create({
      consigneeId,
      date: new Date(date),
      filePath: fileUrl,
      createdBy: req.user.id
    });

    await consignee.update({ consignmentStatus: 'Invoice Done' });
    await updateTenderStatus(consignee.tenderId);

    res.status(201).json(invoice);
  } catch (error) {
    logger.error('Error uploading invoice:', error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { type } = req.params;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    let containerName;
    let model;
    let updateField;

    switch (type) {
      case 'logistics':
        containerName = containers.LOGISTICS;
        model = LogisticsDetails;
        updateField = 'documents';
        break;
      case 'challan':
        containerName = containers.CHALLAN;
        model = ChallanReceipt;
        updateField = 'filePath';
        break;
      case 'installation':
        containerName = containers.INSTALLATION;
        model = InstallationReport;
        updateField = 'filePath';
        break;
      case 'invoice':
        containerName = containers.INVOICE;
        model = Invoice;
        updateField = 'filePath';
        break;
      default:
        return res.status(400).json({ error: 'Invalid file type' });
    }

    try {
      // Delete the file from Azure
      await deleteAzureFile(url);

      // Update the database only if the file path is valid
      if (updateField === 'documents') {
        // Remove the document URL from the array (in case of logistics or multiple documents)
        await model.update(
          { documents: sequelize.fn('array_remove', sequelize.col('documents'), url) },
          { where: { documents: { [Op.contains]: [url] } } }
        );
      } else {
        // For filePath, ensure we're setting it to null only if that's the intended behavior
        await model.update(
          { [updateField]: null },
          { where: { [updateField]: url } }
        );
      }

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      if (error.message === 'File not found') {
        // Handle the case where the file doesn't exist in Azure storage
        if (updateField === 'documents') {
          await model.update(
            { documents: sequelize.fn('array_remove', sequelize.col('documents'), url) },
            { where: { documents: { [Op.contains]: [url] } } }
          );
        } else {
          // Remove the filePath record if it doesn't exist in Azure, but handle gracefully
          await model.update(
            { [updateField]: null },
            { where: { [updateField]: url } }
          );
        }
        res.json({ message: 'File record removed from database' });
      } else {
        // Re-throw the error if it's not a file not found issue
        throw error;
      }
    }
  } catch (error) {
    logger.error('Error deleting file:', error);
    res.status(500).json({ error: error.message });
  }
};

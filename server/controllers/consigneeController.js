import logger from '../config/logger.js';
import { ChallanReceipt, Consignee, InstallationReport, Invoice, LogisticsDetails } from '../models/index.js';
import { updateTenderStatus } from '../utils/tenderStatus.js';

export const createConsignee = async (req, res) => {
  try {
    const consignee = await Consignee.create(req.body);
    res.status(201).json(consignee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getConsignees = async (req, res) => {
  try {
    const { districts } = req.query;
    const where = {};

    if (districts) {
      where.districtName = districts.split(',');
    }

    const consignees = await Consignee.findAll({
      where,
      include: [
        { model: LogisticsDetails, as: 'logisticsDetails' },
        { model: ChallanReceipt, as: 'challanReceipt' },
        { model: InstallationReport, as: 'installationReport' },
        { model: Invoice, as: 'invoice' }
      ]
    });

    res.json(consignees);
  } catch (error) {
    logger.error('Error fetching consignees:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateConsigneeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const consignee = await Consignee.findByPk(id);

    if (!consignee) {
      return res.status(404).json({ error: 'Consignee not found' });
    }

    await consignee.update(req.body);
    logger.info(`Consignee ${id} status updated`);
    res.json(consignee);
  } catch (error) {
    logger.error('Error updating consignee:', error);
    res.status(500).json({ error: error.message });
  }
};
export const getConsigneeFiles = async (req, res) => {
  try {
    const { id, type } = req.params;
    let files = [];

    switch (type) {
      case 'logistics':
        const logistics = await LogisticsDetails.findOne({ where: { consigneeId: id } });
        files = logistics?.documents || [];
        break;
      case 'challan':
        const challan = await ChallanReceipt.findOne({ where: { consigneeId: id } });
        files = challan?.filePath ? [challan.filePath] : [];
        break;
      case 'installation':
        const installation = await InstallationReport.findOne({ where: { consigneeId: id } });
        files = installation?.filePath ? [installation.filePath] : [];
        break;
      case 'invoice':
        const invoice = await Invoice.findOne({ where: { consigneeId: id } });
        files = invoice?.filePath ? [invoice.filePath] : [];
        break;
      default:
        return res.status(400).json({ error: 'Invalid file type' });
    }

    res.json({ files });
  } catch (error) {
    logger.error('Error fetching consignee files:', error);
    res.status(500).json({ error: error.message });
  }
};
export const getConsigneeDetails = async (req, res) => {
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
        }
      ]
    });

    if (!consignee) {
      return res.status(404).json({ error: 'Consignee not found' });
    }

    res.json(consignee);
  } catch (error) {
    logger.error('Error fetching consignee details:', error);
    res.status(500).json({ error: error.message });
  }
};
export const updateAccessoriesStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { accessoryName, status } = req.body;

    const consignee = await Consignee.findByPk(id);
    if (!consignee) {
      return res.status(404).json({ error: 'Consignee not found' });
    }

    const currentAccessories = consignee.accessoriesPending;
    const updatedItems = currentAccessories.items.filter(item => item !== accessoryName);

    const updatedAccessories = {
      status: updatedItems.length > 0,
      count: updatedItems.length,
      items: updatedItems
    };

    await consignee.update({ accessoriesPending: updatedAccessories });

    // Update tender status if needed  
    await updateTenderStatus(consignee.tenderId);

    res.json({ message: 'Accessories status updated successfully', consignee });
  } catch (error) {
    logger.error('Error updating accessories status:', error);
    res.status(500).json({ error: error.message });
  }
};  
import { parse } from 'csv-parse/sync';
import logger from '../config/logger.js';
import { Consignee, sequelize, Tender } from '../models/index.js';
import { validateInstallationRequest } from '../validators/installation.validator.js';

export const createInstallationRequest = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const validatedData = validateInstallationRequest(req.body);

    // Create tender/installation request  
    const tender = await Tender.create({
      tenderNumber: validatedData.tender_number,
      authorityType: validatedData.authority_type,
      poDate: validatedData.po_contract_date,
      contractDate: validatedData.po_contract_date,
      equipmentName: validatedData.equipment,
      leadTimeToDeliver: validatedData.lead_time_to_deliver,
      leadTimeToInstall: validatedData.lead_time_to_install,
      remarks: validatedData.remarks,
      hasAccessories: validatedData.has_accessories,
      accessories: validatedData.selected_accessories,
      // Set accessoriesPending based on whether there are selected accessories  
      accessoriesPending: validatedData.has_accessories &&
        validatedData.selected_accessories &&
        validatedData.selected_accessories.length > 0,
      status: 'Draft',
      createdBy: req.user.id
    }, { transaction });

    // Create consignees/locations with proper accessoriesPending  
    if (validatedData.locations?.length > 0) {
      await Consignee.bulkCreate(
        validatedData.locations.map((loc, index) => ({
          tenderId: tender.id,
          srNo: (index + 1).toString(),
          districtName: loc.districtName,
          blockName: loc.blockName,
          facilityName: loc.facilityName,
          consignmentStatus: 'Processing',
          // Set accessoriesPending for each consignee  
          accessoriesPending: {
            status: validatedData.has_accessories &&
              validatedData.selected_accessories &&
              validatedData.selected_accessories.length > 0,
            count: validatedData.selected_accessories?.length || 0,
            items: validatedData.selected_accessories || []
          }
        })),
        { transaction }
      );
    }

    await transaction.commit();
    logger.info(`Tender/Installation request created: ${tender.id}`);

    // Fetch complete tender with consignees  
    const completeTender = await Tender.findByPk(tender.id, {
      include: [{
        model: Consignee,
        as: 'consignees'
      }]
    });

    res.status(201).json(completeTender);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating tender/installation request:', error);
    res.status(400).json({ error: error.message });
  }
};

export const getInstallationRequests = async (req, res) => {
  try {
    const tenders = await Tender.findAll({
      include: [{
        model: Consignee,
        as: 'consignees'
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(tenders);
  } catch (error) {
    logger.error('Error fetching tenders:', error);
    res.status(500).json({ error: error.message });
  }
};

export const uploadConsigneeCSV = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const fileContent = req.file.buffer.toString();
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    const locations = records.map((record, index) => ({
      srNo: (index + 1).toString(),
      districtName: record.district_name?.trim(),
      blockName: record.block_name?.trim(),
      facilityName: record.facility_name?.trim()
    }));

    const warnings = [];
    const seen = new Set();
    locations.forEach(loc => {
      const key = `${loc.districtName}-${loc.blockName}-${loc.facilityName}`;
      if (seen.has(key)) {
        warnings.push(`Duplicate entry found: ${key}`);
      }
      seen.add(key);
    });

    res.json({
      locations,
      warnings: warnings.length > 0 ? warnings : null
    });
  } catch (error) {
    logger.error('Error processing CSV:', error);
    res.status(400).json({ error: error.message });
  }
};

export const downloadTemplate = async (req, res) => {
  try {
    const template = 'district_name,block_name,facility_name\n';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=consignee_template.csv');
    res.send(template);
  } catch (error) {
    logger.error('Error downloading template:', error);
    res.status(500).json({ error: 'Error downloading template' });
  }
};
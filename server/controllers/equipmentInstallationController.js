import { parse } from 'csv-parse/sync';
import logger from '../config/logger.js';
import { Consignee, sequelize, Tender, Machine } from '../models/index.js';
import { validateInstallationRequest } from '../validators/installation.validator.js';
import { deleteAzureFile, uploadFile } from '../utils/azureStorage.js';

export const createInstallationRequest = async (req, res) => {
  try {
    // Debug log to see what's coming in
    logger.info('Request body:', req.body);
    logger.info('Request files:', req.files);

    let formData;
    try {
      // Check if data exists and handle different formats
      if (!req.body.data) {
        return res.status(400).json({
          error: 'Missing data field in request',
          required: 'Form field "data" containing JSON string is required'
        });
      }

      formData = typeof req.body.data === 'string' 
        ? JSON.parse(req.body.data) 
        : req.body.data;

      logger.info('Parsed form data:', formData);
    } catch (error) {
      logger.error('Error parsing form data:', error);
      return res.status(400).json({ 
        error: 'Invalid JSON data format',
        details: error.message,
        received: req.body.data
      });
    }

    if (!formData) {
      return res.status(400).json({
        error: 'Invalid request data',
        message: 'Form data is required'
      });
    }

    const validatedData = validateInstallationRequest(formData);
    const {
      tender_number,
      authority_type,
      tender_start_date,
      tender_end_date,
      loa_number,
      loa_date,
      po_number,
      po_date,
      contract_date,
      equipment_name,
      lead_time_to_deliver,
      lead_time_to_install,
      machine_quantity,
      remarks,
      has_accessories,
      selected_accessories,
      has_consumables,
      selected_consumables,
      selected_machines,
      locations
    } = validatedData;

    // Check if tender number already exists
    const existingTender = await Tender.findOne({
      where: { tenderNumber: validatedData.tender_number }
    });

    if (existingTender) {
      return res.status(409).json({
        error: 'Duplicate tender number',
        message: `Tender with number ${validatedData.tender_number} already exists`,
        tenderId: existingTender.id
      });
    }

    // Upload documents if provided
    let tenderDocUrl, loaDocUrl, poDocUrl;
    
    try {
      if (req.files?.tenderDoc?.[0]) {
        tenderDocUrl = await uploadFile(req.files.tenderDoc[0], 'TENDER');
        logger.info('Tender document uploaded:', tenderDocUrl);
      }
      if (req.files?.loaDoc?.[0]) {
        loaDocUrl = await uploadFile(req.files.loaDoc[0], 'LOA');
        logger.info('LOA document uploaded:', loaDocUrl);
      }
      if (req.files?.poDoc?.[0]) {
        poDocUrl = await uploadFile(req.files.poDoc[0], 'PO');
        logger.info('PO document uploaded:', poDocUrl);
      }
    } catch (error) {
      logger.error('Error uploading documents:', error);
      return res.status(400).json({
        error: 'Document upload failed',
        details: error.message
      });
    }

    // Create tender with transaction
    const result = await sequelize.transaction(async (t) => {
      try {
        // Create the tender
        const tender = await Tender.create({
          tenderNumber: validatedData.tender_number,
          authorityType: validatedData.authority_type,
          tenderStartDate: validatedData.tender_start_date,
          tenderEndDate: validatedData.tender_end_date,
          tenderDocument: tenderDocUrl,
          loaNumber: validatedData.loa_number,
          loaDate: validatedData.loa_date,
          loaDocument: loaDocUrl,
          poNumber: validatedData.po_number,
          poDate: validatedData.po_date,
          poDocument: poDocUrl,
          contractDate: validatedData.contract_date,
          equipmentName: validatedData.equipment_name,
          leadTimeToDeliver: validatedData.lead_time_to_deliver,
          leadTimeToInstall: validatedData.lead_time_to_install,
          machineQuantity: validatedData.machine_quantity,
          remarks: validatedData.remarks,
          hasAccessories: validatedData.has_accessories,
          hasConsumables: validatedData.has_consumables,
          selectedAccessories: JSON.stringify({
            items: Array.isArray(validatedData.selected_accessories) ? validatedData.selected_accessories : [],
            pending: Array.isArray(validatedData.selected_accessories) ? validatedData.selected_accessories : []
          }),
          selectedConsumables: JSON.stringify({
            items: Array.isArray(validatedData.selected_consumables) ? validatedData.selected_consumables : [],
            pending: Array.isArray(validatedData.selected_consumables) ? validatedData.selected_consumables : []
          }),
          accessoriesPending: validatedData.has_accessories && 
            Array.isArray(validatedData.selected_accessories) && 
            validatedData.selected_accessories.length > 0,
          consumablesPending: validatedData.has_consumables && 
            Array.isArray(validatedData.selected_consumables) && 
            validatedData.selected_consumables.length > 0,
          status: 'Draft',
          createdBy: req.user.id
        }, { transaction: t });

        // Associate machines if provided and valid
        if (validatedData.selected_machines?.length > 0) {
          // Validate that all machine IDs are valid UUIDs
          const validMachineIds = validatedData.selected_machines.filter(id => {
            try {
              // Simple UUID validation
              return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
            } catch (e) {
              return false;
            }
          });

          if (validMachineIds.length > 0) {
            await tender.addMachines(validMachineIds, { transaction: t });
          }
        }

        // Create consignees
        if (validatedData.locations?.length > 0) {
          await Consignee.bulkCreate(
            validatedData.locations.map((loc, index) => ({
              tenderId: tender.id,
              srNo: (index + 1).toString(),
              districtName: loc.districtName,
              blockName: loc.blockName,
              facilityName: loc.facilityName,
              quantity: loc.quantity || 1,
              consignmentStatus: 'Processing'
            })),
            { transaction: t }
          );
        }

        // Fetch the created tender with all associations
        return await Tender.findByPk(tender.id, {
          include: [
            {
              model: Consignee,
              as: 'consignees'
            },
            {
              model: Machine,
              as: 'machines',
              through: { attributes: [] }
            }
          ],
          transaction: t
        });
      } catch (error) {
        // If there's an error, delete any uploaded files
        if (tenderDocUrl) await deleteAzureFile(tenderDocUrl);
        if (loaDocUrl) await deleteAzureFile(loaDocUrl);
        if (poDocUrl) await deleteAzureFile(poDocUrl);
        throw error;
      }
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error creating installation request:', error);
    
    // Handle specific error types
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'Duplicate tender number',
        message: `Tender with number ${validatedData.tender_number} already exists`
      });
    }

    res.status(400).json({ 
      error: error.message,
      details: error.errors?.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
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
      facilityName: record.facility_name?.trim(),
      contactName: record.contact_name?.trim(),
      contactPhone: record.contact_phone?.trim(),
      contactEmail: record.contact_email?.trim(),
      quantity: parseInt(record.quantity) || 1
    }));

    const invalidQuantities = locations.filter(loc => 
      isNaN(loc.quantity) || loc.quantity < 1
    );

    if (invalidQuantities.length > 0) {
      return res.status(400).json({
        error: 'Invalid quantities found',
        details: 'Quantity must be a positive number'
      });
    }

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
    const template = 'district_name,block_name,facility_name,contact_name,contact_phone,contact_email,quantity\n';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=consignee_template.csv');
    res.send(template);
  } catch (error) {
    logger.error('Error downloading template:', error);
    res.status(500).json({ error: 'Error downloading template' });
  }
};

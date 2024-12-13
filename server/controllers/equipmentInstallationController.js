import { parse } from 'csv-parse/sync';
import { Op } from 'sequelize';
import logger from '../config/logger.js';
import { 
  Consignee, 
  EquipmentInstallation, 
  EquipmentLocation, 
  sequelize, 
  Tender 
} from '../models/index.js';
import { logActivity } from '../services/auditService.js';
import { validateInstallationRequest } from '../validators/installation.validator.js';

class EquipmentInstallationController {
  async createInstallationRequest(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const validatedData = validateInstallationRequest(req.body);
      const { locations, ...tenderData } = validatedData;

      // Create tender/installation request
      const tender = await Tender.create({
        ...tenderData,
        createdBy: req.user.id
      }, { transaction });

      // Create equipment installation record
      const installation = await EquipmentInstallation.create({
        tenderId: tender.id,
        status: 'Pending',
        createdBy: req.user.id
      }, { transaction });

      // Create location records
      if (locations?.length) {
        await EquipmentLocation.bulkCreate(
          locations.map(location => ({
            ...location,
            installationId: installation.id,
            createdBy: req.user.id
          })),
          { transaction }
        );
      }

      await logActivity(
        req.user.id,
        'CREATE_INSTALLATION_REQUEST',
        'EquipmentInstallation',
        installation.id,
        {},
        { tender: tenderData, locations },
        transaction
      );

      await transaction.commit();

      res.status(201).json({
        message: 'Installation request created successfully',
        tender,
        installation
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async getInstallationRequests(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status,
        district,
        search,
        startDate,
        endDate
      } = req.query;

      const whereClause = {
        ...(status && { status }),
        ...(startDate && endDate && {
          createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        })
      };

      const locationWhereClause = {
        ...(district && { district }),
        ...(search && {
          [Op.or]: [
            { facility: { [Op.iLike]: `%${search}%` } },
            { block: { [Op.iLike]: `%${search}%` } }
          ]
        })
      };

      const { rows, count } = await EquipmentInstallation.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: EquipmentLocation,
            as: 'locations',
            where: Object.keys(locationWhereClause).length ? locationWhereClause : undefined
          },
          {
            model: Tender,
            attributes: ['tenderNumber', 'equipmentName']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset: (page - 1) * limit,
        distinct: true
      });

      res.json({
        installations: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInstallationStatus(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { status, remarks } = req.body;

      const installation = await EquipmentInstallation.findByPk(id, {
        include: ['locations']
      });

      if (!installation) {
        return next(new Error('Installation request not found'));
      }

      const oldValues = installation.toJSON();
      await installation.update({
        status,
        remarks,
        updatedBy: req.user.id
      }, { transaction });

      await logActivity(
        req.user.id,
        'UPDATE_INSTALLATION_STATUS',
        'EquipmentInstallation',
        id,
        oldValues,
        installation.toJSON(),
        transaction
      );

      await transaction.commit();
      res.json(installation);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async processCSVUpload(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      if (!req.file) {
        return next(new Error('No file uploaded'));
      }

      const fileContent = req.file.buffer.toString('utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });

      const locations = await EquipmentLocation.bulkCreate(
        records.map(record => ({
          ...record,
          installationId: req.params.id,
          createdBy: req.user.id
        })),
        { transaction }
      );

      await logActivity(
        req.user.id,
        'UPLOAD_LOCATIONS_CSV',
        'EquipmentInstallation',
        req.params.id,
        {},
        { locations: records },
        transaction
      );

      await transaction.commit();
      res.json({
        message: 'CSV processed successfully',
        locationsAdded: locations.length
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async downloadTemplate(req, res, next) {
    try {
      const template = 'district,block,facility,contact_person,contact_number\n';
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=installation_locations_template.csv');
      res.send(template);
    } catch (error) {
      next(error);
    }
  }
}

export default new EquipmentInstallationController();
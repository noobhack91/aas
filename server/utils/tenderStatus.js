// server/utils/tenderStatus.js  

import { Tender, Consignee, sequelize } from '../models/index.js';  
import logger from '../config/logger.js';  

class TenderStatusManager {  
  static async updateStatus(tenderId, transaction) {  
    try {  
      const tender = await Tender.findByPk(tenderId, {  
        include: [{  
          model: Consignee,  
          as: 'consignees',  
          include: [  
            'logisticsDetails',  
            'challanReceipt',  
            'installationReport',  
            'invoice'  
          ]  
        }],  
        transaction  
      });  

      if (!tender) {  
        logger.error(`Tender ${tenderId} not found`);  
        return null;  
      }  

      const status = this.calculateStatus(tender.consignees);  
      if (tender.status !== status) {  
        await tender.update({ status }, { transaction });  
        logger.info(`Updated tender ${tenderId} status to ${status}`);  
      }  

      return status;  
    } catch (error) {  
      logger.error('Error updating tender status:', error);  
      throw error;  
    }  
  }  

  static calculateStatus(consignees) {  
    if (!consignees?.length) {  
      return 'Draft';  
    }  

    const stats = this.calculateConsigneeStats(consignees);  
    return this.determineStatusFromStats(stats);  
  }  

  static calculateConsigneeStats(consignees) {  
    return consignees.reduce((stats, consignee) => {  
      const progress = this.calculateConsigneeProgress(consignee);  
      return {  
        total: stats.total + 1,  
        complete: stats.complete + (progress.isComplete ? 1 : 0),  
        inProgress: stats.inProgress + (progress.hasAnyProgress && !progress.isComplete ? 1 : 0)  
      };  
    }, { total: 0, complete: 0, inProgress: 0 });  
  }  

  static calculateConsigneeProgress(consignee) {  
    const hasLogistics = !!consignee.logisticsDetails;  
    const hasChallan = !!consignee.challanReceipt;  
    const hasInstallation = !!consignee.installationReport;  
    const hasInvoice = !!consignee.invoice;  

    return {  
      hasLogistics,  
      hasChallan,  
      hasInstallation,  
      hasInvoice,  
      isComplete: hasLogistics && hasChallan && hasInstallation && hasInvoice,  
      hasAnyProgress: hasLogistics || hasChallan || hasInstallation || hasInvoice  
    };  
  }  

  static determineStatusFromStats(stats) {  
    if (stats.total === stats.complete && stats.total > 0) {  
      return 'Completed';  
    }  
    if (stats.complete > 0 || stats.inProgress > 0) {  
      return stats.complete > 0 ? 'Partially Completed' : 'In Progress';  
    }  
    return 'Draft';  
  }  

  static async updateBulkStatus(tenderIds, transaction) {  
    try {  
      const updates = await Promise.all(  
        tenderIds.map(id => this.updateStatus(id, transaction))  
      );  
      return updates.filter(Boolean);  
    } catch (error) {  
      logger.error('Error updating bulk tender statuses:', error);  
      throw error;  
    }  
  }  
}  

export const updateTenderStatus = TenderStatusManager.updateStatus.bind(TenderStatusManager);  
export const updateBulkTenderStatus = TenderStatusManager.updateBulkStatus.bind(TenderStatusManager);  
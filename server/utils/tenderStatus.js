// server/utils/tenderStatus.js  

import { Tender, Consignee } from '../models/index.js';  
import logger from '../config/logger.js';  

export const updateTenderStatus = async (tenderId) => {  
  try {  
    const tender = await Tender.findByPk(tenderId, {  
      include: [{  
        model: Consignee,  
        as: 'consignees',  
        include: ['logisticsDetails', 'challanReceipt', 'installationReport', 'invoice']  
      }]  
    });  

    if (!tender) {  
      logger.error(`Tender ${tenderId} not found`);  
      return;  
    }  

    const consignees = tender.consignees || [];  

    // Calculate progress for each consignee  
    const consigneeProgress = consignees.map(c => ({  
      hasLogistics: !!c.logisticsDetails,  
      hasChallan: !!c.challanReceipt,  
      hasInstallation: !!c.installationReport,  
      hasInvoice: !!c.invoice,  
      isComplete: !!c.logisticsDetails && !!c.challanReceipt &&   
                 !!c.installationReport && !!c.invoice  
    }));  

    // Determine overall tender status  
    const totalConsignees = consignees.length;  
    const completedConsignees = consigneeProgress.filter(c => c.isComplete).length;  
    const hasAnyActivity = consigneeProgress.some(c =>   
      c.hasLogistics || c.hasChallan || c.hasInstallation || c.hasInvoice  
    );  

    let newStatus = 'Draft';  

    if (totalConsignees === completedConsignees && totalConsignees > 0) {  
      newStatus = 'Completed';  
    } else if (completedConsignees > 0) {  
      newStatus = 'Partially Completed';  
    } else if (hasAnyActivity) {  
      newStatus = 'In Progress';  
    }  

    if (tender.status !== newStatus) {  
      await tender.update({ status: newStatus });  
      logger.info(`Updated tender ${tenderId} status to ${newStatus}`);  
    }  

    return newStatus;  
  } catch (error) {  
    logger.error('Error updating tender status:', error);  
    throw error;  
  }  
};  
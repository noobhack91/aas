import logger from '../config/logger.js';
import { Tender } from '../models/index.js';

// Get status of all items for a tender
export const getTenderItemsStatus = async (req, res) => {
  try {
    const { tenderId } = req.params;
    
    const tender = await Tender.findByPk(tenderId);
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    res.json({
      accessories: {
        all: tender.selectedAccessories.items,
        pending: tender.selectedAccessories.pending,
        isComplete: !tender.accessoriesPending
      },
      consumables: {
        all: tender.selectedConsumables.items,
        pending: tender.selectedConsumables.pending,
        isComplete: !tender.consumablesPending
      }
    });
  } catch (error) {
    logger.error('Error fetching tender items status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark single accessory as complete
export const markAccessoryComplete = async (req, res) => {
  try {
    const { tenderId, accessoryName } = req.params;
    
    const tender = await Tender.findByPk(tenderId);
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    const currentAccessories = tender.selectedAccessories;
    const pendingAccessories = currentAccessories.pending.filter(
      item => item !== accessoryName
    );

    await tender.update({
      selectedAccessories: {
        items: currentAccessories.items,
        pending: pendingAccessories
      },
      accessoriesPending: pendingAccessories.length > 0
    });

    res.json({
      message: 'Accessory marked as complete',
      accessory: accessoryName,
      remainingPending: pendingAccessories,
      isComplete: pendingAccessories.length === 0
    });
  } catch (error) {
    logger.error('Error marking accessory as complete:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark single consumable as complete
export const markConsumableComplete = async (req, res) => {
  try {
    const { tenderId, consumableName } = req.params;
    
    const tender = await Tender.findByPk(tenderId);
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    const currentConsumables = tender.selectedConsumables;
    const pendingConsumables = currentConsumables.pending.filter(
      item => item !== consumableName
    );

    await tender.update({
      selectedConsumables: {
        items: currentConsumables.items,
        pending: pendingConsumables
      },
      consumablesPending: pendingConsumables.length > 0
    });

    res.json({
      message: 'Consumable marked as complete',
      consumable: consumableName,
      remainingPending: pendingConsumables,
      isComplete: pendingConsumables.length === 0
    });
  } catch (error) {
    logger.error('Error marking consumable as complete:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark multiple accessories as complete
export const markMultipleAccessoriesComplete = async (req, res) => {
  try {
    const { tenderId } = req.params;
    const { accessories } = req.body;

    if (!Array.isArray(accessories)) {
      return res.status(400).json({ error: 'Accessories must be an array' });
    }

    const tender = await Tender.findByPk(tenderId);
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    const currentAccessories = tender.selectedAccessories;
    const pendingAccessories = currentAccessories.pending.filter(
      item => !accessories.includes(item)
    );

    await tender.update({
      selectedAccessories: {
        items: currentAccessories.items,
        pending: pendingAccessories
      },
      accessoriesPending: pendingAccessories.length > 0
    });

    res.json({
      message: 'Accessories marked as complete',
      completedAccessories: accessories,
      remainingPending: pendingAccessories,
      isComplete: pendingAccessories.length === 0
    });
  } catch (error) {
    logger.error('Error marking multiple accessories as complete:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark multiple consumables as complete
export const markMultipleConsumablesComplete = async (req, res) => {
  try {
    const { tenderId } = req.params;
    const { consumables } = req.body;

    if (!Array.isArray(consumables)) {
      return res.status(400).json({ error: 'Consumables must be an array' });
    }

    const tender = await Tender.findByPk(tenderId);
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    const currentConsumables = tender.selectedConsumables;
    const pendingConsumables = currentConsumables.pending.filter(
      item => !consumables.includes(item)
    );

    await tender.update({
      selectedConsumables: {
        items: currentConsumables.items,
        pending: pendingConsumables
      },
      consumablesPending: pendingConsumables.length > 0
    });

    res.json({
      message: 'Consumables marked as complete',
      completedConsumables: consumables,
      remainingPending: pendingConsumables,
      isComplete: pendingConsumables.length === 0
    });
  } catch (error) {
    logger.error('Error marking multiple consumables as complete:', error);
    res.status(500).json({ error: error.message });
  }
}; 
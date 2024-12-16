// server/controllers/itemsController.js  
import logger from '../config/logger.js';
import { Accessory, Consumable } from '../models/index.js';

// Get all accessories  
export const getAccessories = async (req, res) => {  
  try {  
    const accessories = await Accessory.findAll({  
      where: { isActive: true }  
    });  
    res.json(accessories);  
  } catch (error) {  
    logger.error('Error fetching accessories:', error);  
    res.status(500).json({ error: error.message });  
  }  
};  

// Create accessory  
export const createAccessory = async (req, res) => {  
  try {  
    const accessory = await Accessory.create(req.body);  
    res.status(201).json(accessory);  
  } catch (error) {  
    logger.error('Error creating accessory:', error);  
    res.status(400).json({ error: error.message });  
  }  
};  

// Update accessory  
export const updateAccessory = async (req, res) => {  
  try {  
    const { id } = req.params;  
    const accessory = await Accessory.findByPk(id);  
    if (!accessory) {  
      return res.status(404).json({ error: 'Accessory not found' });  
    }  
    await accessory.update(req.body);  
    res.json(accessory);  
  } catch (error) {  
    logger.error('Error updating accessory:', error);  
    res.status(400).json({ error: error.message });  
  }  
};  

// Delete accessory  
export const deleteAccessory = async (req, res) => {  
  try {  
    const { id } = req.params;  
    const accessory = await Accessory.findByPk(id);  
    if (!accessory) {  
      return res.status(404).json({ error: 'Accessory not found' });  
    }  
    await accessory.update({ isActive: false });  
    res.json({ message: 'Accessory deleted successfully' });  
  } catch (error) {  
    logger.error('Error deleting accessory:', error);  
    res.status(400).json({ error: error.message });  
  }  
};  

// Similar functions for consumables  
export const getConsumables = async (req, res) => {  
  try {  
    const consumables = await Consumable.findAll({  
      where: { isActive: true }  
    });  
    res.json(consumables);  
  } catch (error) {  
    logger.error('Error fetching consumables:', error);  
    res.status(500).json({ error: error.message });  
  }  
};  

export const createConsumable = async (req, res) => {  
  try {  
    const consumable = await Consumable.create(req.body);  
    res.status(201).json(consumable);  
  } catch (error) {  
    logger.error('Error creating consumable:', error);  
    res.status(400).json({ error: error.message });  
  }  
};  

export const updateConsumable = async (req, res) => {  
  try {  
    const { id } = req.params;  
    const consumable = await Consumable.findByPk(id);  
    if (!consumable) {  
      return res.status(404).json({ error: 'Consumable not found' });  
    }  
    await consumable.update(req.body);  
    res.json(consumable);  
  } catch (error) {  
    logger.error('Error updating consumable:', error);  
    res.status(400).json({ error: error.message });  
  }  
};  

export const deleteConsumable = async (req, res) => {  
  try {  
    const { id } = req.params;  
    const consumable = await Consumable.findByPk(id);  
    if (!consumable) {  
      return res.status(404).json({ error: 'Consumable not found' });  
    }  
    await consumable.update({ isActive: false });  
    res.json({ message: 'Consumable deleted successfully' });  
  } catch (error) {  
    logger.error('Error deleting consumable:', error);  
    res.status(400).json({ error: error.message });  
  }  
};  
import logger from '../config/logger.js';
import { Machine } from '../models/index.js';

export const getMachines = async (req, res) => {
  try {
    const machines = await Machine.findAll({
      where: { isActive: true }
    });
    res.json(machines);
  } catch (error) {
    logger.error('Error fetching machines:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createMachine = async (req, res) => {
  try {
    const machine = await Machine.create(req.body);
    res.status(201).json(machine);
  } catch (error) {
    logger.error('Error creating machine:', error);
    res.status(400).json({ error: error.message });
  }
};

export const updateMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const machine = await Machine.findByPk(id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    await machine.update(req.body);
    res.json(machine);
  } catch (error) {
    logger.error('Error updating machine:', error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const machine = await Machine.findByPk(id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    await machine.update({ isActive: false });
    res.json({ message: 'Machine deleted successfully' });
  } catch (error) {
    logger.error('Error deleting machine:', error);
    res.status(400).json({ error: error.message });
  }
}; 
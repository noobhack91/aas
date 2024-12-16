// server/routes/itemsRoutes.js  
import express from 'express';  
import {  
  getAccessories,  
  createAccessory,  
  updateAccessory,  
  deleteAccessory,  
  getConsumables,  
  createConsumable,  
  updateConsumable,  
  deleteConsumable  
} from '../controllers/itemsController.js';  
import { authenticate, authorize } from '../middleware/auth.js';  

const router = express.Router();  

router.use(authenticate);  

// Accessories routes  
router.get('/accessories', getAccessories);  
router.post('/accessories', authorize('admin'), createAccessory);  
router.put('/accessories/:id', authorize('admin'), updateAccessory);  
router.delete('/accessories/:id', authorize('admin'), deleteAccessory);  

// Consumables routes  
router.get('/consumables', getConsumables);  
router.post('/consumables', authorize('admin'), createConsumable);  
router.put('/consumables/:id', authorize('admin'), updateConsumable);  
router.delete('/consumables/:id', authorize('admin'), deleteConsumable);  

export default router;  
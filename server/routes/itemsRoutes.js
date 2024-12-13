// server/routes/itemsRoutes.js  
import express from 'express';  
import itemsController from '../controllers/itemsController.js';  
import { authenticate, authorize } from '../middleware/auth.js';  

const router = express.Router();  

router.use(authenticate);  

// Accessories routes  
router.get('/accessories', itemsController.getAccessories);  
router.post(  
  '/accessories',  
  authorize('admin'),  
  itemsController.createAccessory  
);  
router.patch(  
  '/accessories/:id',  
  authorize('admin'),  
  itemsController.updateAccessory  
);  

// Consumables routes  
router.get('/consumables', itemsController.getConsumables);  
router.post(  
  '/consumables',  
  authorize('admin'),  
  itemsController.createConsumable  
);  
router.patch(  
  '/consumables/:id',  
  authorize('admin'),  
  itemsController.updateConsumable  
);  

// Stats  
router.get('/stats', itemsController.getItemStats);  

export default router;  
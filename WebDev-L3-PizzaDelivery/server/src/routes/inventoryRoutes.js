import express from 'express';
import {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  restockItem,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Allow public read of available inventory for the pizza customizer (or protect for admin)
router.get('/', getInventory);

// Admin-only management endpoints
router.post('/', protect, adminOnly, addInventoryItem);
router.patch('/:id', protect, adminOnly, updateInventoryItem);
router.post('/:id/restock', protect, adminOnly, restockItem);
router.delete('/:id', protect, adminOnly, deleteInventoryItem);

export default router;

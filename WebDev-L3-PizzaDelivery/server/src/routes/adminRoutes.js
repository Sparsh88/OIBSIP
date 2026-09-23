import express from 'express';
import {
  adminLogin,
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public Admin Login
router.post('/login', adminLogin);

// Protected Admin Routes
router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;

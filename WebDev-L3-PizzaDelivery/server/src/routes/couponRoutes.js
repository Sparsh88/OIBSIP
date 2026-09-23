import express from 'express';
import {
  getAllCoupons,
  getCouponByCode,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
} from '../controllers/couponController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public / Customer routes
router.get('/', getAllCoupons);
router.get('/:code', getCouponByCode);

// Admin-only CRUD routes
router.post('/', protect, authorizeAdmin, createCoupon);
router.patch('/:id', protect, authorizeAdmin, updateCoupon);
router.patch('/:id/toggle', protect, authorizeAdmin, toggleCouponStatus);
router.delete('/:id', protect, authorizeAdmin, deleteCoupon);

export default router;

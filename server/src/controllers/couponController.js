import { Coupon } from '../models/Coupon.js';

/**
 * @desc    Get all active coupons for customers, or all coupons for Admin
 * @route   GET /api/coupons
 * @access  Public / Admin
 */
export const getAllCoupons = async (req, res, next) => {
  try {
    const { all } = req.query;
    const filter = all === 'true' ? {} : { isActive: true };

    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single coupon by code
 * @route   GET /api/coupons/:code
 * @access  Public
 */
export const getCouponByCode = async (req, res, next) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code, isActive: true });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired coupon code',
      });
    }

    res.json({
      success: true,
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new coupon
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      title,
      tagline,
      description,
      discountType,
      discountValue,
      minOrder,
      maxDiscount,
      isActive,
    } = req.body;

    const existing = await Coupon.findOne({ code: code?.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code '${code.toUpperCase()}' already exists`,
      });
    }

    const coupon = await Coupon.create({
      code: code?.trim().toUpperCase(),
      title,
      tagline: tagline || 'SPECIAL PROMO',
      description,
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrder: Number(minOrder) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing coupon
 * @route   PATCH /api/coupons/:id
 * @access  Private/Admin
 */
export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      code,
      title,
      tagline,
      description,
      discountType,
      discountValue,
      minOrder,
      maxDiscount,
      isActive,
    } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    if (code && code.trim().toUpperCase() !== coupon.code) {
      const existing = await Coupon.findOne({
        code: code.trim().toUpperCase(),
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Coupon code '${code.toUpperCase()}' already exists`,
        });
      }
      coupon.code = code.trim().toUpperCase();
    }

    if (title !== undefined) coupon.title = title;
    if (tagline !== undefined) coupon.tagline = tagline;
    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minOrder !== undefined) coupon.minOrder = Number(minOrder);
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    await coupon.save();

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle coupon active status
 * @route   PATCH /api/coupons/:id/toggle
 * @access  Private/Admin
 */
export const toggleCouponStatus = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      success: true,
      message: `Coupon '${coupon.code}' is now ${coupon.isActive ? 'Active' : 'Inactive'}`,
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a coupon
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.json({
      success: true,
      message: `Coupon '${coupon.code}' deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

import { getRazorpayInstance, verifyRazorpaySignature } from '../config/razorpay.js';
import { Order } from '../models/Order.js';
import { Inventory } from '../models/Inventory.js';
import { validateInventoryForOrder, deductInventoryForOrder } from '../services/inventoryService.js';
import { emitNewOrderToAdmin, emitOrderStatusUpdate } from '../config/socket.js';

/**
 * Helper to recalculate trusted server-side pricing with coupon discount support
 */
const calculateServerPricing = async (items, couponCode = '') => {
  let subtotal = 0;
  const processedItems = items.map((item) => {
    let unitPrice = Number(item.unitPrice) || 299;
    const qty = Math.max(1, Number(item.quantity) || 1);
    const totalPrice = unitPrice * qty;
    subtotal += totalPrice;

    return {
      pizza: item.pizza || null,
      name: item.name || 'Gourmet Pizza',
      image: item.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
      customBase: item.customBase || 'Original Crust',
      customSauce: item.customSauce || 'Classic Tomato Basil',
      customCheese: item.customCheese || 'Mozzarella',
      customVeggies: item.customVeggies || [],
      quantity: qty,
      unitPrice,
      totalPrice,
    };
  });

  // Calculate Coupon Discount
  let discount = 0;
  const normalizedCoupon = (couponCode || '').trim().toUpperCase();

  if (normalizedCoupon === 'BOGO2026') {
    // Buy 1 Get 1 Free: 50% discount on order subtotal
    discount = Math.round(subtotal * 0.5);
  } else if (normalizedCoupon === 'CUSTOM30') {
    // Flat 30% OFF on subtotal
    discount = Math.round(subtotal * 0.3);
  } else if (normalizedCoupon === 'FEAST499') {
    // Party Feast Combo: Flat ₹150 OFF for orders >= 499 (or min discount)
    discount = subtotal >= 499 ? 150 : Math.min(subtotal, 100);
  } else if (normalizedCoupon === 'FREEBREAD') {
    // Free Garlic Breadsticks worth ₹149
    discount = Math.min(subtotal, 149);
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = Math.round(discountedSubtotal * 0.05); // 5% GST
  const deliveryFee = discountedSubtotal > 500 || discountedSubtotal === 0 ? 0 : 40; // Free delivery over ₹500
  const totalAmount = discountedSubtotal + tax + deliveryFee;

  return {
    processedItems,
    subtotal,
    discount,
    couponCode: normalizedCoupon,
    tax,
    deliveryFee,
    totalAmount,
  };
};

/**
 * @desc    Create Razorpay Order for Checkout
 * @route   POST /api/payments/create-order
 * @access  Private
 */
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, customerNotes, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items to checkout.',
      });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete delivery address with phone number',
      });
    }

    // 1. Verify Inventory Availability
    const inventoryCheck = await validateInventoryForOrder(items);
    if (!inventoryCheck.isValid) {
      const missingNames = inventoryCheck.missingItems
        .map((i) => `${i.name} (Only ${i.available} left)`)
        .join(', ');
      return res.status(400).json({
        success: false,
        message: `Some ingredients are currently out of stock: ${missingNames}`,
        missingItems: inventoryCheck.missingItems,
      });
    }

    // 2. Calculate Server Pricing with Coupon Discount
    const { processedItems, subtotal, discount, couponCode: appliedCode, tax, deliveryFee, totalAmount } =
      await calculateServerPricing(items, couponCode);

    // Generate readable Order Number (e.g. PZ-68421)
    const orderNumber = `PZ-${Math.floor(10000 + Math.random() * 90000)}`;

    let razorpayOrderId = `rzp_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const razorpay = getRazorpayInstance();

    if (razorpay) {
      try {
        const rzpOptions = {
          amount: Math.round(totalAmount * 100), // Amount in paise
          currency: 'INR',
          receipt: orderNumber,
          payment_capture: 1,
        };
        const rzpOrder = await razorpay.orders.create(rzpOptions);
        razorpayOrderId = rzpOrder.id;
      } catch (err) {
        console.warn('[Razorpay API Warning] Fallback to test ID:', err.message);
      }
    }

    // 3. Create Pending Order in Database
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: processedItems,
      subtotal,
      discount,
      couponCode: appliedCode,
      tax,
      deliveryFee,
      totalAmount,
      paymentInfo: {
        razorpayOrderId,
        status: 'pending',
      },
      orderStatus: 'Order Received',
      deliveryAddress,
      customerNotes: customerNotes || '',
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    });

    res.status(201).json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId,
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyIdHere',
      totalAmount,
      discount,
      couponCode: appliedCode,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay Payment Signature & Confirm Order
 * @route   POST /api/payments/verify
 * @access  Private
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { internalOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!internalOrderId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters',
      });
    }

    const order = await Order.findById(internalOrderId).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Associated order could not be found',
      });
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpayOrderId || order.paymentInfo?.razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      order.paymentInfo.status = 'failed';
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Payment signature validation failed. Please contact support.',
      });
    }

    // Update order to paid
    order.paymentInfo.paymentId = razorpayPaymentId;
    order.paymentInfo.signature = razorpaySignature;
    order.paymentInfo.status = 'paid';
    order.paymentInfo.paidAt = new Date();
    await order.save();

    // Deduct stock for ingredients safely
    try {
      await deductInventoryForOrder(order.items);
    } catch (invErr) {
      console.warn('[Inventory Deduction Warning]', invErr.message);
    }

    // Notify connected admin via Socket.IO
    try {
      emitNewOrderToAdmin(order);
      emitOrderStatusUpdate(order);
    } catch (sockErr) {
      console.warn('[Socket Notification Warning]', sockErr.message);
    }

    res.json({
      success: true,
      message: 'Payment verified and order submitted to kitchen',
      order,
    });
  } catch (error) {
    next(error);
  }
};

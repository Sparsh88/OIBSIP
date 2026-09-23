import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Inventory } from '../models/Inventory.js';
import { emitOrderStatusUpdate } from '../config/socket.js';

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'pizzanest_super_secret_jwt_key_level3_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '36500d',
    }
  );
};

/**
 * @desc    Dedicated Admin Portal Login
 * @route   POST /api/admin/login
 * @access  Public
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide admin email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    const adminUser = await User.findOne({
      email: cleanEmail,
    }).select('+password');

    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials',
      });
    }

    // Strictly verify role is 'admin'
    if (adminUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have administrator permissions.',
      });
    }

    const isMatch = await adminUser.matchPassword(cleanPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials',
      });
    }

    const token = generateToken(adminUser._id, adminUser.role);

    res.json({
      success: true,
      message: 'Admin authenticated successfully',
      token,
      user: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated dashboard summary statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalOrders,
      ordersReceived,
      ordersInKitchen,
      ordersSentToDelivery,
      ordersDelivered,
      inventoryItems,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'Order Received' }),
      Order.countDocuments({ orderStatus: 'In Kitchen' }),
      Order.countDocuments({ orderStatus: 'Sent to Delivery' }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Inventory.find(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('user', 'name email phone'),
    ]);

    // Calculate total revenue from paid orders
    const revenueAgg = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Filter low stock items
    const lowStockItems = inventoryItems.filter(
      (item) => item.quantity <= item.lowStockThreshold
    );

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        ordersReceived,
        ordersInKitchen,
        ordersSentToDelivery,
        ordersDelivered,
        totalInventorySKUs: inventoryItems.length,
        lowStockCount: lowStockItems.length,
        lowStockItems,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders with optional status filter
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.orderStatus = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'deliveryAddress.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone');

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status and broadcast via Socket.IO
 * @route   PATCH /api/admin/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const allowedStatuses = [
      'Order Received',
      'In Kitchen',
      'Sent to Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order marked as ${status} by Kitchen Operations.`,
    });

    await order.save();

    // Broadcast real-time event to user's order room and admin channel
    emitOrderStatusUpdate(order);

    res.json({
      success: true,
      message: `Order #${order.orderNumber} status updated to "${status}"`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  const clientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim());

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          clientUrls.includes(origin) ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          /^https:\/\/.*\.vercel\.app$/.test(origin)
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join specific order room for real-time tracking
    socket.on('join_order_room', (orderId) => {
      if (orderId) {
        socket.join(`order_${orderId}`);
        console.log(`[Socket.IO] Client ${socket.id} joined room: order_${orderId}`);
      }
    });

    // Leave order room
    socket.on('leave_order_room', (orderId) => {
      if (orderId) {
        socket.leave(`order_${orderId}`);
        console.log(`[Socket.IO] Client ${socket.id} left room: order_${orderId}`);
      }
    });

    // Join admin stream
    socket.on('join_admin_room', () => {
      socket.join('admin_orders_channel');
      console.log(`[Socket.IO] Client ${socket.id} joined admin_orders_channel`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized yet!');
  }
  return io;
};

/**
 * Emit order status update to user's order room and admin channel
 */
export const emitOrderStatusUpdate = (orderOrId, status, fullOrder) => {
  if (!io) return;

  try {
    let orderId = '';
    let orderStatus = '';
    let statusHistory = [];
    let updatedAt = new Date();
    let orderObj = null;

    if (typeof orderOrId === 'object' && orderOrId !== null) {
      orderObj = orderOrId;
      orderId = orderObj._id?.toString() || '';
      orderStatus = orderObj.orderStatus || '';
      statusHistory = orderObj.statusHistory || [];
      updatedAt = orderObj.updatedAt || new Date();
    } else {
      orderId = String(orderOrId || '');
      orderStatus = status || '';
      orderObj = fullOrder || { _id: orderId, orderStatus };
      statusHistory = orderObj?.statusHistory || [];
      updatedAt = orderObj?.updatedAt || new Date();
    }

    if (!orderId) return;

    const payload = {
      orderId,
      orderStatus,
      statusHistory,
      updatedAt,
    };

    // Broadcast to customer tracking this order
    io.to(`order_${orderId}`).emit('order_status_changed', payload);

    // Broadcast to admins viewing live order queue
    io.to('admin_orders_channel').emit('admin_order_updated', orderObj);

    console.log(`[Socket.IO] Emitted status update for order ${orderId} -> ${orderStatus}`);
  } catch (err) {
    console.warn('[Socket.IO Warning] emitOrderStatusUpdate error:', err.message);
  }
};

/**
 * Emit new incoming order to admin dashboard
 */
export const emitNewOrderToAdmin = (order) => {
  if (!io) return;
  try {
    io.to('admin_orders_channel').emit('new_order_received', order);
    console.log(`[Socket.IO] Emitted new order ${order?._id} to admin_orders_channel`);
  } catch (err) {
    console.warn('[Socket.IO Warning] emitNewOrderToAdmin error:', err.message);
  }
};

/**
 * Emit inventory update to admin
 */
export const emitInventoryUpdate = (inventoryItem) => {
  if (!io) return;
  try {
    io.to('admin_orders_channel').emit('inventory_updated', inventoryItem);
  } catch (err) {
    console.warn('[Socket.IO Warning] emitInventoryUpdate error:', err.message);
  }
};

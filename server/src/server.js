import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { initLowStockCronJob } from './jobs/lowStockNotifier.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect Database
    await connectDB();

    // 2. Create HTTP Server
    const httpServer = http.createServer(app);

    // 3. Initialize Socket.IO
    initSocket(httpServer);
    console.log('[Socket.IO] Real-time engine attached to HTTP server.');

    // 4. Initialize Background Cron Job
    initLowStockCronJob();

    // 5. Start Listening
    httpServer.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 PIZZANEST SERVER IS RUNNING IN ${process.env.NODE_ENV || 'development'} MODE`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🍕 Health check: http://localhost:${PORT}/api/health`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('[Server Startup Error]:', err.message);
    process.exit(1);
  }
};

startServer();

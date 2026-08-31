import cron from 'node-cron';
import { Inventory } from '../models/Inventory.js';
import { sendLowStockAlertEmail } from '../services/emailService.js';

/**
 * Check inventory items below their threshold and send alert email if not in cooldown
 */
export const checkAndNotifyLowStock = async () => {
  try {
    console.log('[Cron Job] Checking inventory levels against low-stock safety thresholds...');

    const inventoryItems = await Inventory.find();
    const lowStockItems = inventoryItems.filter(
      (item) => item.quantity <= item.lowStockThreshold
    );

    if (lowStockItems.length === 0) {
      console.log('[Cron Job] All inventory levels are optimal. No low-stock alerts needed.');
      return { count: 0, alerted: false };
    }

    console.warn(`[Cron Job] Found ${lowStockItems.length} items below threshold:`, lowStockItems.map(i => `${i.name} (${i.quantity}/${i.lowStockThreshold})`).join(', '));

    // Filter items that haven't received an alert in the past 4 hours to avoid spamming
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const itemsNeedingAlert = lowStockItems.filter(
      (item) => !item.lastAlertSentAt || item.lastAlertSentAt < fourHoursAgo
    );

    if (itemsNeedingAlert.length > 0) {
      console.log(`[Cron Job] Dispatching low-stock alert email for ${itemsNeedingAlert.length} items...`);
      await sendLowStockAlertEmail(itemsNeedingAlert);

      // Update lastAlertSentAt timestamp for these items
      const itemIds = itemsNeedingAlert.map((i) => i._id);
      await Inventory.updateMany(
        { _id: { $in: itemIds } },
        { $set: { lastAlertSentAt: new Date() } }
      );
      return { count: itemsNeedingAlert.length, alerted: true };
    } else {
      console.log('[Cron Job] Low-stock alert was already sent recently (within cooldown).');
      return { count: lowStockItems.length, alerted: false, cooldown: true };
    }
  } catch (error) {
    console.error('[Cron Job Error] Failed to execute low-stock check:', error.message);
    return { error: error.message };
  }
};

/**
 * Initialize node-cron scheduled job
 */
export const initLowStockCronJob = () => {
  const cronExpression = process.env.LOW_STOCK_CRON || '*/10 * * * *';

  cron.schedule(cronExpression, async () => {
    console.log(`[node-cron] Running scheduled low-stock inventory check at ${new Date().toISOString()}`);
    await checkAndNotifyLowStock();
  });

  console.log(`[node-cron] Low-stock notification scheduler initialized with expression: "${cronExpression}"`);
};

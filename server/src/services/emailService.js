import { sendEmail } from '../config/mailer.js';

/**
 * Send password reset email with secure token link
 */
export const sendPasswordResetEmail = async (userEmail, resetToken, originUrl) => {
  const resetLink = `${originUrl || 'http://localhost:5173'}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0d1117; color: #f0f6fc; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #161b22; border-radius: 12px; padding: 32px; border: 1px solid #30363d; }
        .header { text-align: center; border-bottom: 1px solid #30363d; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: 800; color: #ff5e3a; letter-spacing: -0.5px; }
        .content { padding: 24px 0; font-size: 16px; line-height: 1.6; color: #c9d1d9; }
        .btn { display: inline-block; background: #ff5e3a; color: #ffffff !important; padding: 14px 28px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; margin: 20px 0; text-align: center; }
        .token-box { background: #21262d; border: 1px dashed #8b949e; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 16px; word-break: break-all; margin: 15px 0; }
        .footer { font-size: 12px; color: #8b949e; text-align: center; border-top: 1px solid #30363d; padding-top: 20px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🍕 PIZZANEST CRAFT KITCHEN</div>
        </div>
        <div class="content">
          <h2 style="color: #ffffff; margin-top: 0;">Password Reset Request</h2>
          <p>We received a request to reset the password for your PizzaNest account (${userEmail}).</p>
          <p>Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="btn">Reset Password</a>
          </div>
          <p>Or paste this link into your browser:</p>
          <div class="token-box">${resetLink}</div>
          <p>If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} PizzaNest Pizza Delivery Platform. OASIS INFOBYTE Internship Project.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: userEmail,
    subject: '🔐 Reset Your PizzaNest Password',
    html,
  });
};

/**
 * Send low-stock alert email to administrator
 */
export const sendLowStockAlertEmail = async (lowStockItems, adminEmail) => {
  const targetEmail = adminEmail || process.env.ADMIN_EMAIL || 'admin@pizzanest.com';

  const itemsTableRows = lowStockItems
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #30363d;">
        <td style="padding: 12px; font-weight: 600; color: #f0f6fc;">${item.name}</td>
        <td style="padding: 12px; text-transform: uppercase; color: #8b949e; font-size: 12px;">${item.category}</td>
        <td style="padding: 12px; color: #ff7b72; font-weight: 700;">${item.quantity} ${item.unit}</td>
        <td style="padding: 12px; color: #d29922;">${item.lowStockThreshold} ${item.unit}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0d1117; color: #f0f6fc; margin: 0; padding: 20px; }
        .container { max-width: 650px; margin: 0 auto; background: #161b22; border-radius: 12px; padding: 32px; border: 1px solid #da3633; }
        .header { text-align: center; border-bottom: 1px solid #30363d; padding-bottom: 20px; }
        .logo { font-size: 26px; font-weight: 800; color: #ff5e3a; }
        .alert-badge { background: #b62324; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; display: inline-block; margin-top: 10px; }
        .content { padding: 24px 0; font-size: 15px; line-height: 1.6; color: #c9d1d9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #0d1117; border-radius: 8px; overflow: hidden; }
        th { background: #21262d; text-align: left; padding: 12px; font-size: 13px; color: #8b949e; border-bottom: 2px solid #30363d; }
        .footer { font-size: 12px; color: #8b949e; text-align: center; border-top: 1px solid #30363d; padding-top: 20px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🍕 PIZZANEST INVENTORY ALERT SYSTEM</div>
          <div class="alert-badge">⚠️ LOW INVENTORY DETECTED</div>
        </div>
        <div class="content">
          <h3 style="color: #ffffff; margin-top: 0;">Urgent Restock Required</h3>
          <p>The automated inventory monitor detected that <strong>${lowStockItems.length}</strong> ingredient(s) have fallen below their configured safety thresholds:</p>
          
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min Threshold</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableRows}
            </tbody>
          </table>

          <p>Please log in to the <strong>PizzaNest Admin Dashboard</strong> to restock these items before customer orders are impacted.</p>
        </div>
        <div class="footer">
          <p>Automated notice dispatched by PizzaNest <code>node-cron</code> scheduler &bull; OASIS INFOBYTE Internship Level 3</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: targetEmail,
    subject: `🚨 [Low Stock Alert] ${lowStockItems.length} Ingredient(s) Below Threshold`,
    html,
  });
};

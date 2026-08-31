import nodemailer from 'nodemailer';

let transporter = null;

export const getMailerTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (host && user && pass && user !== 'your_email@gmail.com') {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log(`[Nodemailer] Configured SMTP transporter for host: ${host}`);
  } else {
    // Fallback: Create test ethereal account for seamless zero-setup testing
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Nodemailer] Created ephemeral Ethereal test account: ${testAccount.user}`);
    } catch (err) {
      console.warn('[Nodemailer] Could not create Ethereal test account. Creating stream transporter.', err.message);
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  return transporter;
};

/**
 * Send an email and log the preview URL if available
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailer = await getMailerTransporter();
    const from = process.env.EMAIL_FROM || '"PizzaNest Kitchen" <no-reply@pizzanest.com>';

    const info = await mailer.sendMail({
      from,
      to,
      subject,
      text: text || html?.replace(/<[^>]*>?/gm, ''),
      html,
    });

    console.log(`[Email Sent] MessageId: ${info.messageId} to: ${to}`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Preview URL (Ethereal)]: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(`[Email Error] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

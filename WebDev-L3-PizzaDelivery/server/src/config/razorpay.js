import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance = null;

export const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayInstance && key_id && key_secret && key_id !== 'rzp_test_YourTestKeyIdHere') {
    try {
      razorpayInstance = new Razorpay({
        key_id,
        key_secret,
      });
      console.log('[Razorpay] Initialized official SDK in TEST MODE');
    } catch (err) {
      console.warn('[Razorpay] Failed to initialize official SDK:', err.message);
    }
  }

  return razorpayInstance;
};

/**
 * Verify Razorpay payment signature
 * signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_for_internship_demo';
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  // If using live keys, verify exact HMAC
  if (process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET !== 'YourRazorpaySecretKeyHere') {
    return expectedSignature === signature;
  }

  // In local test/simulation mode without real keys, accept signature or test prefix
  return signature === expectedSignature || signature?.startsWith('sim_sig_') || signature?.startsWith('razorpay_sig_');
};

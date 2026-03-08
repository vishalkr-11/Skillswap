// src/middleware/verifyWebhook.middleware.js
const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Verifies the Razorpay webhook signature.
 * Razorpay sends X-Razorpay-Signature header with HMAC-SHA256 of raw body.
 * IMPORTANT: This middleware must be applied BEFORE express.json() parses the body.
 */
function verifyRazorpayWebhook(req, res, next) {
  const secret    = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!secret) {
    logger.error('RAZORPAY_WEBHOOK_SECRET not set');
    return res.status(500).json({ success: false, message: 'Webhook secret not configured' });
  }

  if (!signature) {
    return res.status(400).json({ success: false, message: 'Missing webhook signature' });
  }

  // req.rawBody is set by express.json with verify option (see app.js change below)
  const rawBody = req.rawBody;
  if (!rawBody) {
    return res.status(400).json({ success: false, message: 'No raw body available for verification' });
  }

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  if (expectedSig !== signature) {
    logger.warn('Invalid Razorpay webhook signature');
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  next();
}

module.exports = { verifyRazorpayWebhook };
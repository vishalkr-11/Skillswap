// src/controllers/payment.controller.js
const paymentService = require('../services/payment.service');
const { sendResponse } = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for the given bookingId.
 * Body: { bookingId }
 */
const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'bookingId is required' });
  }
  const order = await paymentService.createOrder({
    bookingId,
    userId: req.user.id,
  });
  sendResponse(res, 201, 'Razorpay order created', { order });
});

/**
 * POST /api/payments/verify
 * Verifies Razorpay HMAC signature and confirms the booking.
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({
      success: false,
      message: 'razorpayOrderId, razorpayPaymentId, and razorpaySignature are all required',
    });
  }

  const result = await paymentService.verifyPayment({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    userId: req.user.id,
  });

  sendResponse(res, 200, 'Payment verified successfully', result);
});

/**
 * POST /api/payments/webhook
 * Razorpay webhook — signature verified by verifyRazorpayWebhook middleware.
 * No auth header needed (Razorpay calls this directly).
 */
const webhook = asyncHandler(async (req, res) => {
  const event   = req.body?.event;
  const payload = req.body?.payload;

  if (!event || !payload) {
    return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
  }

  // Respond immediately — process async so Razorpay doesn't retry
  res.status(200).json({ received: true });

  try {
    await paymentService.handleWebhook(event, payload);
  } catch (err) {
    logger.error('Webhook processing error:', err);
  }
});

module.exports = { createOrder, verifyPayment, webhook };
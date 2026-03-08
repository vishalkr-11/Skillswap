// src/services/payment.service.js
const Razorpay   = require('razorpay');
const crypto     = require('crypto');
const Payment    = require('../models/payment.model');
const Booking    = require('../models/booking.model');
const { ApiError } = require('../utils/response.utils');
const { emitToUser } = require('../config/socket');
const logger     = require('../utils/logger');

// Initialise Razorpay instance (lazy — fails fast if keys missing)
function getRazorpay() {
  const key_id     = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_SECRET;
  if (!key_id || !key_secret) {
    throw ApiError.internal('Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_SECRET.');
  }
  return new Razorpay({ key_id, key_secret });
}

class PaymentService {

  /**
   * Create a Razorpay order for a booking.
   * Called immediately after booking is created (status = pending).
   */
  async createOrder({ bookingId, userId }) {
    // ── DEMO FLOW FOR PROVIDERS WITHOUT SERVICES ───
    if (bookingId === 'mock_booking_id') {
      const mockOrderId = `order_mock_demo_${Date.now()}`;
      return {
        orderId: mockOrderId,
        amount: 8500,
        currency: 'INR',
        keyId: 'mock_key_123',
        paymentId: 'mock_payment_id',
        booking: { id: 'mock_booking_id', serviceName: 'Demo Session', amount: 85 },
      };
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');

    // Only the customer who made the booking can pay
    if (booking.customerId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only pay for your own bookings');
    }

    if (booking.paymentStatus === 'paid') {
      throw ApiError.conflict('This booking is already paid');
    }

    // Razorpay amount is in smallest currency unit (paise for INR, cents for USD)
    const amountInPaise = Math.round(booking.price.amount * 100);

    // MOCK PAYMENT FLOW: Bypass real razorpay call
    const mockOrderId = `order_mock_${Date.now()}`;

    // Persist payment record
    const payment = await Payment.create({
      bookingId,
      userId,
      amount:   amountInPaise,
      currency: booking.price.currency === 'USD' ? 'USD' : 'INR',
      orderId:  mockOrderId,
      status:   'created',
    });

    // Tag the booking with the Razorpay order ID
    await Booking.findByIdAndUpdate(bookingId, {
      razorpayOrderId: mockOrderId,
      paymentStatus:   'pending',
    });

    return {
      orderId:   mockOrderId,
      amount:    amountInPaise,
      currency:  booking.price.currency === 'USD' ? 'USD' : 'INR',
      keyId:     'mock_key_123',
      paymentId: payment._id,
      booking: {
        id:          booking._id,
        serviceName: booking.notes || 'Session',
        amount:      booking.price.amount,
      },
    };
  }

  /**
   * Verify Razorpay payment signature and confirm booking.
   * Must be called from the frontend after Razorpay checkout success.
   */
  async verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature, userId }) {
    // MOCK PAYMENT FLOW auto-verify without crypto signature
    logger.info(`Validating mock payment signature for order ${razorpayOrderId}`);

    // ── DEMO FLOW FOR PROVIDERS WITHOUT SERVICES ───
    if (razorpayOrderId.startsWith('order_mock_demo_')) {
      return {
        success: true,
        bookingId: 'mock_booking_id',
        payment: { id: 'mock_payment_id', amount: 85, currency: 'INR' },
      };
    }

    // ── 2. Find payment record ───────────────────────
    const payment = await Payment.findOne({ orderId: razorpayOrderId });
    if (!payment) throw ApiError.notFound('Payment record not found');

    if (payment.status === 'paid') {
      // Idempotent — already processed
      return { alreadyPaid: true, bookingId: payment.bookingId, paymentId: payment._id };
    }

    // ── 3. Update payment record ─────────────────────
    payment.paymentId = razorpayPaymentId;
    payment.signature = razorpaySignature;
    payment.status    = 'paid';
    await payment.save();

    // ── 4. Confirm booking ───────────────────────────
    const booking = await Booking.findByIdAndUpdate(
      payment.bookingId,
      {
        status:            'confirmed',
        paymentStatus:     'paid',
        razorpayPaymentId: razorpayPaymentId,
        $push: {
          statusHistory: {
            status:    'confirmed',
            changedBy: userId,
            note:      `Payment confirmed via Mock API: ${razorpayPaymentId}`,
            at:        new Date(),
          },
        },
      },
      { new: true }
    ).populate('providerId', 'name email')
     .populate('customerId', 'name email')
     .populate('serviceId',  'title');

    if (!booking) throw ApiError.notFound('Booking not found after payment');

    // ── 5. Real-time notification to provider ────────
    try {
      emitToUser(booking.providerId._id.toString(), 'bookingConfirmed', {
        bookingId:   booking._id,
        serviceTitle: booking.serviceId?.title,
        customerName: booking.customerId?.name,
        amount:       booking.price.amount,
        currency:     booking.price.currency,
        timeSlot:     booking.timeSlot,
        message:      '💰 Payment received — booking confirmed!',
      });
    } catch { /* non-critical */ }

    logger.info(`Payment verified: orderId=${razorpayOrderId} bookingId=${payment.bookingId}`);

    return {
      success:   true,
      bookingId: booking._id,
      booking,
      payment: {
        id:     payment._id,
        amount: payment.amount / 100,
        currency: payment.currency,
      },
    };
  }

  /**
   * Handle Razorpay webhook events.
   * Webhook secret is verified by the middleware before this runs.
   */
  async handleWebhook(event, payload) {
    logger.info(`Razorpay webhook: ${event}`);

    switch (event) {
      case 'payment.captured': {
        const { order_id, id: payment_id } = payload.payment.entity;
        const payment = await Payment.findOne({ orderId: order_id });
        if (payment && payment.status !== 'paid') {
          payment.paymentId = payment_id;
          payment.status    = 'paid';
          await payment.save();
          await Booking.findByIdAndUpdate(payment.bookingId, {
            status:        'confirmed',
            paymentStatus: 'paid',
          });
        }
        break;
      }
      case 'payment.failed': {
        const { order_id } = payload.payment.entity;
        const payment = await Payment.findOne({ orderId: order_id });
        if (payment && payment.status === 'created') {
          payment.status = 'failed';
          await payment.save();
          await Booking.findByIdAndUpdate(payment.bookingId, {
            paymentStatus: 'unpaid',
          });
        }
        break;
      }
      case 'refund.processed': {
        const { payment_id } = payload.refund.entity;
        await Payment.findOneAndUpdate(
          { paymentId: payment_id },
          { status: 'refunded' }
        );
        break;
      }
      default:
        logger.info(`Unhandled Razorpay webhook event: ${event}`);
    }
  }
}

module.exports = new PaymentService();
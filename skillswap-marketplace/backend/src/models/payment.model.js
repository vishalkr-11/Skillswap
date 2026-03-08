// src/models/payment.model.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  gateway: {
    type: String,
    default: 'razorpay',
  },
  // Razorpay order ID — created before payment
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // Razorpay payment ID — returned after payment success
  paymentId: {
    type: String,
    default: null,
  },
  // HMAC signature from Razorpay — stored for audit
  signature: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed', 'refunded'],
    default: 'created',
    index: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => { delete ret.__v; return ret; },
  },
});

paymentSchema.index({ orderId: 1, status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
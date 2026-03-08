// src/models/booking.model.js
const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // "10:00"
  endTime: { type: String, required: true },   // "12:00"
  duration: { type: Number }, // minutes
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  timeSlot: { type: timeSlotSchema, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending',
    index: true,
  },
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
    at: { type: Date, default: Date.now },
  }],
  price: {
    amount: Number,
    currency: { type: String, default: 'USD' },
  },
  notes: { type: String, maxlength: 1000 },
  address: { type: String },
  isReviewed: { type: Boolean, default: false },
  cancellationReason: String,
  chatId: { type: String },
  // ── Payment tracking ────────────────────────────────
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'pending', 'paid', 'refunded'],
    default: 'unpaid',
    index: true,
  },
  razorpayOrderId: {
    type: String,
    default: null,
  },
  razorpayPaymentId: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => { delete ret.__v; return ret; },
  },
});

// ── Compound indexes ─────────────────────────────────
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ createdAt: -1 });

// ── Pre-save: set chatId ─────────────────────────────
bookingSchema.pre('save', function (next) {
  if (this.isNew) {
    const ids = [this.customerId.toString(), this.providerId.toString()].sort();
    this.chatId = ids.join('_');
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;

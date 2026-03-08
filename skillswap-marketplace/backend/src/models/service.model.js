// src/models/service.model.js
const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['fixed', 'hourly', 'negotiable'],
    default: 'fixed',
  },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
}, { _id: false });

const locationSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], default: [0, 0] },
  address: String,
  city: String,
  state: String,
  country: String,
  radius: { type: Number, default: 10 }, // km
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: 5,
    maxlength: 120,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      // Frontend category ids (primary)
      'coding', 'design', 'tutoring', 'fitness', 'music',
      'plumbing', 'cooking', 'photography', 'language', 'business',
      // Legacy / extra values kept for backward compatibility
      'technology', 'marketing', 'writing', 'cleaning',
      'electrical', 'gardening', 'beauty', 'legal', 'finance', 'other',
    ],
    index: true,
  },
  tags: [{ type: String, trim: true }],
  pricing: { type: pricingSchema, required: true },
  location: locationSchema,
  images: [String],
  isRemote: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  totalBookings: { type: Number, default: 0 },
  slug: { type: String, unique: true },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => { delete ret.__v; return ret; },
  },
});

// ── Indexes ──────────────────────────────────────────
serviceSchema.index({ location: '2dsphere' });
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ 'pricing.amount': 1 });
serviceSchema.index({ 'rating.average': -1 });
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });

// ── Pre-save: generate slug ──────────────────────────
serviceSchema.pre('save', async function (next) {
  if (this.isModified('title') || this.isNew) {
    const base = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    this.slug = `${base}-${this._id.toString().slice(-6)}`;
  }
  next();
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;

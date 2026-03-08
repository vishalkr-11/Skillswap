// src/models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const locationSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  address: String,
  city: String,
  state: String,
  country: String,
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
  },
  startTime: String, // "09:00"
  endTime: String,   // "17:00"
  isAvailable: { type: Boolean, default: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['customer', 'provider', 'admin'],
    default: 'customer',
    required: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    maxlength: 1000,
    default: '',
  },
  location: locationSchema,
  skillsOffered: [{
    type: String,
    trim: true,
  }],
  availability: [availabilitySchema],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },
  refreshToken: { type: String, select: false },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      delete ret.password;
      delete ret.refreshToken;
      delete ret.__v;
      return ret;
    },
  },
});

// ── Indexes ──────────────────────────────────────────
// email index is created automatically by unique:true on the field — no duplicate needed
userSchema.index({ role: 1 });
userSchema.index({ location: '2dsphere' });
userSchema.index({ 'location.city': 1 });   // fast city search
userSchema.index({ skillsOffered: 1 });
userSchema.index({ 'rating.average': -1 });
userSchema.index({ createdAt: -1 });

// ── Pre-save: hash password ──────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare password ───────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── Virtual: full profile URL ────────────────────────
userSchema.virtual('profileUrl').get(function () {
  return `/api/providers/${this._id}`;
});

const User = mongoose.model('User', userSchema);
module.exports = User;

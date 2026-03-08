// src/models/review.model.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type:  mongoose.Schema.Types.ObjectId,
    ref:   'Booking',
    // NOT required — allows profile-page reviews
    sparse: true,
  },
  serviceId: {
    type:  mongoose.Schema.Types.ObjectId,
    ref:   'Service',
    index: true,
    sparse: true,
  },
  providerId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    index:    true,
  },
  customerId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  rating: {
    type:     Number,
    required: [true, 'Rating is required'],
    min:      1,
    max:      5,
  },
  comment: {
    type:     String,
    trim:     true,
    maxlength: 1000,
  },
  isVerified:    { type: Boolean, default: false },
  providerReply: {
    text: String,
    at:   Date,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => { delete ret.__v; return ret; },
  },
});

reviewSchema.index({ providerId: 1, createdAt: -1 });
reviewSchema.index({ customerId: 1, providerId: 1 }); // prevent duplicate profile-page reviews
reviewSchema.index({ serviceId: 1, rating: -1 });

// Post-save: update provider & service ratings
reviewSchema.post('save', async function () {
  const Review  = this.constructor;
  const User    = mongoose.model('User');
  const Service = mongoose.model('Service');

  const providerStats = await Review.aggregate([
    { $match: { providerId: this.providerId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (providerStats.length) {
    await User.findByIdAndUpdate(this.providerId, {
      'rating.average': Math.round(providerStats[0].avg * 10) / 10,
      'rating.count':   providerStats[0].count,
    });
  }

  if (this.serviceId) {
    const serviceStats = await Review.aggregate([
      { $match: { serviceId: this.serviceId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (serviceStats.length) {
      await Service.findByIdAndUpdate(this.serviceId, {
        'rating.average': Math.round(serviceStats[0].avg * 10) / 10,
        'rating.count':   serviceStats[0].count,
      });
    }
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

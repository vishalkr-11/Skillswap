// src/repositories/review.repository.js
const mongoose = require('mongoose');
const Review   = require('../models/review.model');

class ReviewRepository {
  async create(data) {
    return Review.create(data);
  }

  async findByProvider(providerId, { page = 1, limit = 20 } = {}) {
    const query = { providerId: new mongoose.Types.ObjectId(providerId) };
    const skip  = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Review.find(query)
        .populate('customerId', 'name avatar')
        .populate('serviceId',  'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ]);
    return { data, total };
  }

  async findByBooking(bookingId) {
    return Review.findOne({ bookingId }).lean();
  }

  async existsByBooking(bookingId) {
    return Review.exists({ bookingId });
  }

  async addProviderReply(reviewId, providerId, text) {
    return Review.findOneAndUpdate(
      { _id: reviewId, providerId },
      { providerReply: { text, at: new Date() } },
      { new: true }
    );
  }

  async getAggregatedStats(providerId) {
    return Review.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(providerId) } },
      {
        $group: {
          _id:   null,
          average: { $avg: '$rating' },
          count:   { $sum: 1 },
          dist:    { $push: '$rating' },
        },
      },
      {
        $project: {
          average: { $round: ['$average', 1] },
          count:   1,
          five:  { $size: { $filter: { input: '$dist', cond: { $eq: ['$$this', 5] } } } },
          four:  { $size: { $filter: { input: '$dist', cond: { $eq: ['$$this', 4] } } } },
          three: { $size: { $filter: { input: '$dist', cond: { $eq: ['$$this', 3] } } } },
          two:   { $size: { $filter: { input: '$dist', cond: { $eq: ['$$this', 2] } } } },
          one:   { $size: { $filter: { input: '$dist', cond: { $eq: ['$$this', 1] } } } },
        },
      },
    ]);
  }
}

module.exports = new ReviewRepository();

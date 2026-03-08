// src/repositories/booking.repository.js
const mongoose = require('mongoose');
const Booking  = require('../models/booking.model');

class BookingRepository {
  async create(data) {
    const b = await Booking.create(data);
    return this.findById(b._id);
  }

  async findById(id) {
    return Booking.findById(id)
      .populate('serviceId',  'title pricing category')
      .populate('providerId', 'name avatar email')
      .populate('customerId', 'name avatar email')
      .lean();
  }

  async findByCustomer(customerId, { page = 1, limit = 20, status } = {}) {
    const query = { customerId: new mongoose.Types.ObjectId(customerId) };
    if (status) query.status = status;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Booking.find(query)
        .populate('serviceId',  'title pricing category images')
        .populate('providerId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);
    return { data, total };
  }

  async findByProvider(providerId, { page = 1, limit = 20, status } = {}) {
    const query = { providerId: new mongoose.Types.ObjectId(providerId) };
    if (status) query.status = status;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Booking.find(query)
        .populate('serviceId',  'title pricing category images')
        .populate('customerId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);
    return { data, total };
  }

  async updateStatus(id, userId, status, note = '') {
    const booking = await Booking.findById(id);
    if (!booking) return null;
    booking.status = status;
    booking.statusHistory.push({ status, changedBy: userId, note });
    return booking.save();
  }

  async checkConflict(providerId, timeSlot) {
    return Booking.findOne({
      providerId,
      status: { $in: ['pending', 'confirmed'] },
      'timeSlot.date': timeSlot.date,
      $or: [
        {
          'timeSlot.startTime': { $lt: timeSlot.endTime },
          'timeSlot.endTime':   { $gt: timeSlot.startTime },
        },
      ],
    });
  }

  async markReviewed(id) {
    return Booking.findByIdAndUpdate(id, { isReviewed: true });
  }

  async getStats(providerId) {
    return Booking.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(providerId) } },
      {
        $group: {
          _id:          '$status',
          count:        { $sum: 1 },
          totalRevenue: { $sum: '$price.amount' },
        },
      },
    ]);
  }
}

module.exports = new BookingRepository();

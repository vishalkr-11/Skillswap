// src/repositories/service.repository.js
const Service = require('../models/service.model');

class ServiceRepository {
  async create(data) {
    return Service.create(data);
  }

  async findById(id) {
    return Service.findById(id)
      .populate('providerId', 'name avatar rating location skillsOffered')
      .lean();
  }

  async findAll({ filters = {}, page = 1, limit = 20, sort = { createdAt: -1 } } = {}) {
    const query = { isActive: true, ...filters };
    const skip  = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Service.find(query)
        .populate({
          path: 'providerId',
          select: 'name avatar rating isActive',
          match: { isActive: true },  // filter orphaned services from deleted providers
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Service.countDocuments(query),
    ]);
    // Remove services whose provider was deleted (populate returns null when match fails)
    const filtered = data.filter(s => s.providerId != null);
    return { data: filtered, total: filtered.length };
  }

  async search({ text, category, minPrice, maxPrice, page = 1, limit = 20 } = {}) {
    const query = { isActive: true };
    if (text) query.$text = { $search: text };
    if (category) query.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      query['pricing.amount'] = {};
      if (minPrice !== undefined) query['pricing.amount'].$gte = Number(minPrice);
      if (maxPrice !== undefined) query['pricing.amount'].$lte = Number(maxPrice);
    }

    const skip     = (page - 1) * limit;
    const sortStage = text ? { score: { $meta: 'textScore' } } : { 'rating.average': -1 };

    const [data, total] = await Promise.all([
      Service.find(query, text ? { score: { $meta: 'textScore' } } : {})
        .populate('providerId', 'name avatar rating')
        .sort(sortStage)
        .skip(skip)
        .limit(limit)
        .lean(),
      Service.countDocuments(query),
    ]);
    return { data, total };
  }

  async findByProvider(providerId) {
    return Service.find({ providerId, isActive: true })
      .sort({ createdAt: -1 })
      .lean();
  }

  // Batch-load services for multiple providers (used in provider list)
  async findByProviderIds(providerIds) {
    return Service.find({
      providerId: { $in: providerIds },
      isActive: true,
    })
      .sort({ 'rating.average': -1 })
      .lean();
  }

  async update(id, providerId, data) {
    return Service.findOneAndUpdate(
      { _id: id, providerId },
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async softDelete(id, providerId) {
    return Service.findOneAndUpdate(
      { _id: id, providerId },
      { isActive: false }
    );
  }

  async incrementBookings(id) {
    return Service.findByIdAndUpdate(id, { $inc: { totalBookings: 1 } });
  }

  async findForAI(limit = 50) {
    return Service.find({ isActive: true })
      .populate('providerId', 'name avatar rating skillsOffered bio')
      .sort({ 'rating.average': -1, totalBookings: -1 })
      .limit(limit)
      .lean();
  }
}

module.exports = new ServiceRepository();

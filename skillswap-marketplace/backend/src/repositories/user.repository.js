// src/repositories/user.repository.js
const User = require('../models/user.model');

class UserRepository {
  async create(data) {
    return User.create(data);
  }

  async findById(id, selectFields = '') {
    return User.findById(id).select(selectFields);
  }

  async findByEmail(email, includePassword = false) {
    const q = User.findOne({ email: email.toLowerCase() });
    if (includePassword) q.select('+password');
    return q.exec();
  }

  async findProviders({ filters = {}, page = 1, limit = 20, sort = { 'rating.average': -1 } } = {}) {
    const query = { role: 'provider', isActive: true, ...filters };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);
    return { data, total };
  }

  async findProvidersNear(coordinates, radiusKm = 50, extraFilters = {}) {
    return User.find({
      role: 'provider',
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: radiusKm * 1000,
        },
      },
      ...extraFilters,
    }).lean();
  }

  async update(id, data) {
    return User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  }

  async updateRefreshToken(id, token) {
    return User.findByIdAndUpdate(id, { refreshToken: token });
  }

  async exists(email) {
    return User.exists({ email: email.toLowerCase() });
  }

  async softDelete(id) {
    return User.findByIdAndUpdate(id, { isActive: false });
  }

  async findByIds(ids) {
    return User.find({ _id: { $in: ids } }).lean();
  }
}

module.exports = new UserRepository();

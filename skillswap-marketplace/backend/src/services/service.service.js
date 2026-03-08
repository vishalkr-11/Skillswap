// src/services/service.service.js
const serviceRepo = require('../repositories/service.repository');
const { withCache, cacheDel } = require('../utils/cache.utils');
const { ApiError, buildPaginationMeta } = require('../utils/response.utils');

const TTL = parseInt(process.env.CACHE_TTL_SERVICES, 10) || 300;

class ServiceService {
  async listServices({ page = 1, limit = 20, category, text, minPrice, maxPrice } = {}) {
    const cacheKey = `services:list:${page}:${limit}:${category}:${text}:${minPrice}:${maxPrice}`;
    return withCache(cacheKey, TTL, async () => {
      const { data, total } = await (
        text || minPrice !== undefined || maxPrice !== undefined
          ? serviceRepo.search({ text, category, minPrice, maxPrice, page: Number(page), limit: Number(limit) })
          : serviceRepo.findAll({ filters: category ? { category } : {}, page: Number(page), limit: Number(limit) })
      );
      return { services: data, meta: buildPaginationMeta(total, page, limit) };
    });
  }

  async getService(id) {
    return withCache(`services:${id}`, TTL, async () => {
      const service = await serviceRepo.findById(id);
      if (!service) throw ApiError.notFound('Service not found');
      return service;
    });
  }

  async createService(providerId, data) {
    const service = await serviceRepo.create({ ...data, providerId });
    await cacheDel(`services:list:*`);
    await cacheDel(`providers:${providerId}`);
    return service;
  }

  async updateService(id, providerId, data) {
    const service = await serviceRepo.update(id, providerId, data);
    if (!service) throw ApiError.notFound('Service not found or not owned by you');
    await cacheDel(`services:${id}`);
    await cacheDel(`services:list:*`);
    return service;
  }

  async deleteService(id, providerId) {
    const service = await serviceRepo.softDelete(id, providerId);
    if (!service) throw ApiError.notFound('Service not found or not owned by you');
    await cacheDel(`services:${id}`);
    await cacheDel(`services:list:*`);
    return service;
  }
}

module.exports = new ServiceService();

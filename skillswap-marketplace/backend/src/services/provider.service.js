// src/services/provider.service.js
const userRepo    = require('../repositories/user.repository');
const serviceRepo = require('../repositories/service.repository');
const reviewRepo  = require('../repositories/review.repository');
const Service     = require('../models/service.model');
const { withCache, cacheDel } = require('../utils/cache.utils');
const { ApiError, buildPaginationMeta } = require('../utils/response.utils');

const TTL = parseInt(process.env.CACHE_TTL_PROVIDERS, 10) || 300;

// Normalise a User document into the shape the frontend expects
function normaliseProvider(user, services = []) {
  const obj = user.toJSON ? user.toJSON() : user;

  // Primary service — prefer active, fall back to any
  const primaryService = services.find(s => s.isActive !== false) || services[0];

  // Category comes from the provider's primary service
  const category = primaryService?.category || null;

  return {
    ...obj,
    skills:      obj.skillsOffered || [],
    hourlyRate:  primaryService?.pricing?.amount || 0,
    rating:      Math.round((obj.rating?.average ?? 0) * 10) / 10,
    reviewCount: obj.rating?.count ?? 0,
    locationStr: [obj.location?.city, obj.location?.state, obj.location?.country]
      .filter(Boolean).join(', '),
    category,
    services,
  };
}

class ProviderService {
  async listProviders({ page = 1, limit = 20, skill, city, sort = 'rating', q, category } = {}) {
    const filters = {};

    // ── Text search (name / skills) ──────────────────
    if (skill || q) {
      const term = skill || q;
      filters.$or = [
        { skillsOffered: { $in: [new RegExp(term, 'i')] } },
        { name:          { $regex: term, $options: 'i' } },
      ];
    }

    // ── City filter ──────────────────────────────────
    if (city) filters['location.city'] = { $regex: city, $options: 'i' };

    // ── Category filter — join via Services collection ─
    // Find provider IDs who have at least one active service in this category
    if (category) {
      // Map frontend category aliases to all equivalent DB values
      const CATEGORY_ALIASES = {
        coding:   ['coding', 'technology'],
        music:    ['music', 'other'],
        tutoring: ['tutoring', 'stem'],
      };
      const matchCategories = CATEGORY_ALIASES[category] || [category];

      const providerIdsWithCategory = await Service.distinct('providerId', {
        category: { $in: matchCategories },
        isActive: true,
      });

      if (providerIdsWithCategory.length === 0) {
        // No providers in this category — return empty early
        return { providers: [], meta: buildPaginationMeta(0, page, limit) };
      }
      filters._id = { $in: providerIdsWithCategory };
    }

    const sortMap = {
      rating:     { 'rating.average': -1 },
      newest:     { createdAt: -1 },
      name:       { name: 1 },
      price_asc:  { 'rating.average': 1 },
      price_desc: { 'rating.average': -1 },
      reviews:    { 'rating.count': -1 },
    };

    // Don't cache category-filtered results (they're dynamic)
    const cacheKey = `providers:list:${page}:${limit}:${skill}:${city}:${sort}:${q}:${category}`;

    return withCache(cacheKey, TTL, async () => {
      const { data, total } = await userRepo.findProviders({
        filters,
        page:  Number(page),
        limit: Number(limit),
        sort:  sortMap[sort] || sortMap.rating,
      });

      // Batch-load primary services for each provider
      const ids     = data.map(u => u._id);
      const allSvcs = await serviceRepo.findByProviderIds(ids);

      // When a category filter is active, prefer the matching service for hourlyRate
      const providers = data.map(user => {
        let svcs = allSvcs.filter(s => s.providerId?.toString() === user._id.toString());

        if (category) {
          const CATEGORY_ALIASES = { coding: ['coding','technology'], music: ['music','other'], tutoring: ['tutoring','stem'] };
          const matchCats = CATEGORY_ALIASES[category] || [category];
          // Re-sort so matching category service is first (becomes primaryService)
          svcs = [...svcs].sort((a, b) =>
            matchCats.includes(a.category) ? -1 : matchCats.includes(b.category) ? 1 : 0
          );
        }

        return normaliseProvider(user, svcs);
      });

      return { providers, meta: buildPaginationMeta(total, page, limit) };
    });
  }

  async getProvider(id) {
    const cacheKey = `providers:${id}`;

    return withCache(cacheKey, TTL, async () => {
      const provider = await userRepo.findById(id);
      if (!provider || provider.role !== 'provider') {
        throw ApiError.notFound('Provider not found');
      }

      const [services, reviewData] = await Promise.all([
        serviceRepo.findByProvider(id),
        reviewRepo.getAggregatedStats(id),
      ]);

      return {
        provider:    normaliseProvider(provider, services),
        ratingStats: reviewData[0] || null,
      };
    });
  }

  async updateProfile(userId, updates) {
    const allowed = ['name', 'bio', 'avatar', 'location', 'skillsOffered', 'availability'];
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k))
    );

    const user = await userRepo.update(userId, filtered);
    await cacheDel(`providers:${userId}`);
    return user;
  }

  async searchProviders({ lat, lng, radius = 50, skill } = {}) {
    if (!lat || !lng) throw ApiError.badRequest('lat and lng are required');
    const extraFilters = {};
    if (skill) extraFilters.skillsOffered = { $in: [skill] };

    const users = await userRepo.findProvidersNear(
      [parseFloat(lng), parseFloat(lat)],
      parseFloat(radius),
      extraFilters
    );

    return users.map(u => normaliseProvider(u, []));
  }
}

module.exports = new ProviderService();

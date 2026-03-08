// src/services/review.service.js
const reviewRepo  = require('../repositories/review.repository');
const bookingRepo = require('../repositories/booking.repository');
const userRepo    = require('../repositories/user.repository');
const { cacheDel } = require('../utils/cache.utils');
const { ApiError, buildPaginationMeta } = require('../utils/response.utils');

class ReviewService {
  /**
   * Create a review.
   * - If bookingId is provided: validates booking is completed by this customer.
   * - If no bookingId: allows a direct review from provider profile (only one per provider per customer).
   */
  async createReview({ bookingId, providerId, customerId, rating, comment }) {
    let resolvedProviderId = providerId;
    let resolvedServiceId  = null;

    if (bookingId) {
      const booking = await bookingRepo.findById(bookingId);
      if (!booking) throw ApiError.notFound('Booking not found');

      const cid = booking.customerId._id?.toString() || booking.customerId.toString();
      if (cid !== customerId.toString()) {
        throw ApiError.forbidden('You can only review your own bookings');
      }
      if (booking.status !== 'completed') {
        throw ApiError.badRequest('Can only review completed bookings');
      }
      if (booking.isReviewed) {
        throw ApiError.conflict('You have already reviewed this booking');
      }

      const exists = await reviewRepo.existsByBooking(bookingId);
      if (exists) throw ApiError.conflict('Review already exists for this booking');

      resolvedProviderId = (booking.providerId._id || booking.providerId).toString();
      resolvedServiceId  = booking.serviceId._id  || booking.serviceId;

      await bookingRepo.markReviewed(bookingId);
    } else {
      // Direct review from provider profile — validate provider exists
      if (!resolvedProviderId) throw ApiError.badRequest('providerId is required when no bookingId is given');
      const provider = await userRepo.findById(resolvedProviderId);
      if (!provider || provider.role !== 'provider') throw ApiError.notFound('Provider not found');
    }

    const review = await reviewRepo.create({
      bookingId:  bookingId  || undefined,
      serviceId:  resolvedServiceId  || undefined,
      providerId: resolvedProviderId,
      customerId,
      rating,
      comment,
    });

    // Bust provider cache
    await cacheDel(`providers:${resolvedProviderId}`);

    return review;
  }

  async getProviderReviews(providerId, { page = 1, limit = 20 } = {}) {
    const { data, total } = await reviewRepo.findByProvider(providerId, {
      page:  Number(page),
      limit: Number(limit),
    });
    return {
      reviews: data,
      stats:   (await reviewRepo.getAggregatedStats(providerId))[0] || null,
      meta:    buildPaginationMeta(total, page, limit),
    };
  }

  async replyToReview(reviewId, providerId, text) {
    const review = await reviewRepo.addProviderReply(reviewId, providerId, text);
    if (!review) throw ApiError.notFound('Review not found or not owned by you');
    return review;
  }
}

module.exports = new ReviewService();

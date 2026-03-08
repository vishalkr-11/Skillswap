// src/services/booking.service.js
const bookingRepo = require('../repositories/booking.repository');
const serviceRepo = require('../repositories/service.repository');
const { emitToUser } = require('../config/socket');
const notificationJob = require('../jobs/notification.job');
const { ApiError, buildPaginationMeta } = require('../utils/response.utils');

class BookingService {
  async createBooking({ serviceId, customerId, timeSlot, notes, address }) {
    const service = await serviceRepo.findById(serviceId);
    if (!service) throw ApiError.notFound('Service not found');
    if (!service.isActive) throw ApiError.badRequest('Service is no longer available');

    const providerId = service.providerId._id || service.providerId;

    if (customerId.toString() === providerId.toString()) {
      throw ApiError.badRequest('Cannot book your own service');
    }

    // Check time slot conflict
    const conflict = await bookingRepo.checkConflict(providerId, timeSlot);
    if (conflict) throw ApiError.conflict('Provider is not available at this time slot');

    const booking = await bookingRepo.create({
      serviceId,
      providerId,
      customerId,
      timeSlot,
      notes,
      address,
      price: {
        amount: service.pricing.amount,
        currency: service.pricing.currency || 'USD',
      },
      statusHistory: [{ status: 'pending', changedBy: customerId }],
    });

    await serviceRepo.incrementBookings(serviceId);

    // ── Real-time: notify provider ────────────────────
    try {
      emitToUser(providerId.toString(), 'new_booking', {
        bookingId: booking._id,
        service: service.title,
        timeSlot,
        message: 'You have a new booking request!',
      });

      await notificationJob.add('new_booking', {
        userId: providerId,
        bookingId: booking._id,
        serviceTitle: service.title,
      });
    } catch { /* non-critical */ }

    return booking;
  }

  async getCustomerBookings(customerId, query) {
    const { data, total } = await bookingRepo.findByCustomer(customerId, query);
    return { bookings: data, meta: buildPaginationMeta(total, query.page || 1, query.limit || 20) };
  }

  async getProviderBookings(providerId, query) {
    const { data, total } = await bookingRepo.findByProvider(providerId, query);
    return { bookings: data, meta: buildPaginationMeta(total, query.page || 1, query.limit || 20) };
  }

  async updateBookingStatus(bookingId, userId, userRole, status, note) {
    const booking = await bookingRepo.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');

    // ── Permission rules ──────────────────────────────
    const pid = booking.providerId._id?.toString() || booking.providerId.toString();
    const cid = booking.customerId._id?.toString() || booking.customerId.toString();

    const providerActions = ['confirmed', 'rejected', 'in_progress', 'completed'];
    const customerActions = ['cancelled'];

    if (userRole === 'provider' && pid !== userId.toString()) {
      throw ApiError.forbidden('Not your booking');
    }
    if (userRole === 'customer' && cid !== userId.toString()) {
      throw ApiError.forbidden('Not your booking');
    }
    if (userRole === 'provider' && !providerActions.includes(status)) {
      throw ApiError.badRequest(`Providers cannot set status to ${status}`);
    }
    if (userRole === 'customer' && !customerActions.includes(status)) {
      throw ApiError.badRequest(`Customers cannot set status to ${status}`);
    }

    const updated = await bookingRepo.updateStatus(bookingId, userId, status, note);

    // ── Real-time: notify other party ─────────────────
    const notifyId = userRole === 'provider' ? cid : pid;
    try {
      emitToUser(notifyId, 'booking_update', {
        bookingId,
        status,
        note,
        updatedAt: new Date(),
      });
    } catch { /* non-critical */ }

    return updated;
  }
}

module.exports = new BookingService();

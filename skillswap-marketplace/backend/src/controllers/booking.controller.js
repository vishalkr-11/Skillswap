// src/controllers/booking.controller.js
const bookingService = require('../services/booking.service');
const { sendResponse } = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/error.middleware');

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking({
    ...req.body,
    customerId: req.user.id,
  });
  sendResponse(res, 201, 'Booking created', { booking });
});

const getUserBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getCustomerBookings(req.user.id, req.query);
  sendResponse(res, 200, 'Bookings fetched', result);
});

const getProviderBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getProviderBookings(req.user.id, req.query);
  sendResponse(res, 200, 'Provider bookings fetched', result);
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBookingStatus(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body.status,
    req.body.note
  );
  sendResponse(res, 200, 'Booking status updated', { booking });
});

module.exports = { createBooking, getUserBookings, getProviderBookings, updateBookingStatus };

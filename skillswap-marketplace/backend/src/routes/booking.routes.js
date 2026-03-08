// src/routes/booking.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/booking.controller');
const { authenticate, requireCustomer, requireProvider } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createBookingRules, updateStatusRules } = require('../validators/booking.validator');

// POST /api/bookings  (customer creates booking)
router.post('/', authenticate, requireCustomer, createBookingRules, validate, ctrl.createBooking);

// GET /api/bookings/user  (customer's own bookings)
router.get('/user', authenticate, requireCustomer, ctrl.getUserBookings);

// GET /api/bookings/provider  (provider's bookings)
router.get('/provider', authenticate, requireProvider, ctrl.getProviderBookings);

// PATCH /api/bookings/:id/status  (provider confirms/rejects; customer cancels)
router.patch('/:id/status', authenticate, updateStatusRules, validate, ctrl.updateBookingStatus);

module.exports = router;

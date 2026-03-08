// src/validators/booking.validator.js
const { body } = require('express-validator');

const createBookingRules = [
  body('serviceId').isMongoId().withMessage('Valid service ID required'),
  body('timeSlot.date').isISO8601().toDate().withMessage('Valid date required'),
  body('timeSlot.startTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be HH:MM format'),
  body('timeSlot.endTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be HH:MM format'),
  body('notes').optional().isLength({ max: 1000 }),
  body('address').optional().isString(),
];

const updateStatusRules = [
  body('status')
    .isIn(['confirmed', 'rejected', 'cancelled', 'in_progress', 'completed'])
    .withMessage('Invalid status value'),
  body('note').optional().isString().isLength({ max: 500 }),
];

module.exports = { createBookingRules, updateStatusRules };

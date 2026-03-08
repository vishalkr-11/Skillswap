// src/validators/review.validator.js
const { body } = require('express-validator');

const createReviewRules = [
  // bookingId is optional — users can review from a provider profile page
  body('bookingId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId().withMessage('Invalid booking ID'),
  body('providerId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId().withMessage('Invalid provider ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional().trim().isLength({ max: 1000 }),
];

const replyRules = [
  body('text')
    .trim().notEmpty().isLength({ max: 500 })
    .withMessage('Reply text required (max 500 chars)'),
];

module.exports = { createReviewRules, replyRules };

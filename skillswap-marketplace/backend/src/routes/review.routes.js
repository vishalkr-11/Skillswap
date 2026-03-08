// src/routes/review.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/review.controller');
const { authenticate, requireCustomer, requireProvider } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createReviewRules, replyRules } = require('../validators/review.validator');

// POST /api/reviews  (customer submits review)
router.post('/', authenticate, requireCustomer, createReviewRules, validate, ctrl.createReview);

// GET /api/reviews/provider/:id
router.get('/provider/:id', ctrl.getProviderReviews);

// POST /api/reviews/:id/reply  (provider replies)
router.post('/:id/reply', authenticate, requireProvider, replyRules, validate, ctrl.replyToReview);

module.exports = router;

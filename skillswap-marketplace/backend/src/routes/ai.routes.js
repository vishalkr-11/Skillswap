// src/routes/ai.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { aiRateLimiter } = require('../middleware/rateLimiter.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

const recommendRules = [
  body('requirement').trim().notEmpty().isLength({ min: 5, max: 500 }).withMessage('Requirement is required (5-500 chars)'),
  body('budget').optional().isString(),
  body('location').optional().isString(),
  body('category').optional().isString(),
];

// POST /api/ai/recommend
router.post('/recommend', authenticate, aiRateLimiter, recommendRules, validate, ctrl.recommend);

module.exports = router;

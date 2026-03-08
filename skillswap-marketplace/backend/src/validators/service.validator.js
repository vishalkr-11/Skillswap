// src/validators/service.validator.js
const { body } = require('express-validator');

const CATEGORIES = [
  'technology','design','marketing','writing','tutoring',
  'cleaning','plumbing','electrical','gardening','cooking',
  'fitness','beauty','legal','finance','other',
];

const createServiceRules = [
  body('title').trim().isLength({ min: 5, max: 120 }).withMessage('Title must be 5-120 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be 20-2000 characters'),
  body('category').isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('pricing.amount').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('pricing.type').optional().isIn(['fixed', 'hourly', 'negotiable']).withMessage('Invalid pricing type'),
  body('isRemote').optional().isBoolean(),
];

const updateServiceRules = [
  body('title').optional().trim().isLength({ min: 5, max: 120 }),
  body('description').optional().trim().isLength({ min: 20, max: 2000 }),
  body('category').optional().isIn(CATEGORIES),
  body('pricing.amount').optional().isFloat({ min: 0 }),
];

module.exports = { createServiceRules, updateServiceRules };

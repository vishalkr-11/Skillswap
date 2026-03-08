// src/validators/auth.validator.js
const { body } = require('express-validator')

const registerRules = [
  body('name')
    .trim().notEmpty().isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2–100 characters'),
  body('email')
    .isEmail().normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role')
    .optional().isIn(['customer', 'provider'])
    .withMessage('Role must be customer or provider'),
]

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
]

const refreshRules = [
  body('refreshToken').notEmpty().withMessage('Refresh token required'),
]

module.exports = { registerRules, loginRules, refreshRules }

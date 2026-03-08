// src/routes/payment.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { verifyRazorpayWebhook } = require('../middleware/verifyWebhook.middleware');
const { aiRateLimiter } = require('../middleware/rateLimiter.middleware');

// POST /api/payments/create-order  (authenticated customer)
router.post('/create-order', authenticate, ctrl.createOrder);

// POST /api/payments/verify  (authenticated customer)
router.post('/verify', authenticate, ctrl.verifyPayment);

// POST /api/payments/webhook  (Razorpay server — no auth, signature verified)
router.post('/webhook', verifyRazorpayWebhook, ctrl.webhook);

module.exports = router;
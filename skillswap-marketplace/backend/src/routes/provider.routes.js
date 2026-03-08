// src/routes/provider.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/provider.controller');
const { authenticate, requireProvider } = require('../middleware/auth.middleware');

// IMPORTANT: static routes MUST come before /:id to avoid "profile" being treated as an id
router.get('/nearby',  ctrl.searchNearby);                                    // GET /api/providers/nearby
router.patch('/profile', authenticate, requireProvider, ctrl.updateProfile);  // PATCH /api/providers/profile

router.get('/',        ctrl.listProviders);    // GET /api/providers
router.get('/:id',     ctrl.getProvider);      // GET /api/providers/:id  ← must be last

module.exports = router;

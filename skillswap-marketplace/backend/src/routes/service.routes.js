// src/routes/service.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/service.controller');
const { authenticate, requireProvider } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createServiceRules, updateServiceRules } = require('../validators/service.validator');

// GET  /api/services
router.get('/', ctrl.listServices);

// GET  /api/services/:id
router.get('/:id', ctrl.getService);

// POST /api/services  (provider only)
router.post('/', authenticate, requireProvider, createServiceRules, validate, ctrl.createService);

// PUT  /api/services/:id  (provider only)
router.put('/:id', authenticate, requireProvider, updateServiceRules, validate, ctrl.updateService);

// DELETE /api/services/:id  (provider only)
router.delete('/:id', authenticate, requireProvider, ctrl.deleteService);

module.exports = router;

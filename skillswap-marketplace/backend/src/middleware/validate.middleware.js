// src/middleware/validate.middleware.js
const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/response.utils');

// Run validation and return 400 if errors found
function validate(req, _res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((e) => ({
    field: e.path || e.param,
    message: e.msg,
  }));

  return next(ApiError.badRequest('Validation failed', formatted));
}

module.exports = { validate };

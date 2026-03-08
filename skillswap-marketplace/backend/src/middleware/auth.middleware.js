// src/middleware/auth.middleware.js
const { verifyToken } = require('../utils/jwt.utils');
const { ApiError } = require('../utils/response.utils');
const userRepo = require('../repositories/user.repository');

// Verify JWT and attach user to request
async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('No token provided'));
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    // Lightweight DB check — only pulls id, role, isActive
    const user = await userRepo.findById(decoded.id, 'id role isActive');
    if (!user) return next(ApiError.unauthorized('User not found'));
    if (!user.isActive) return next(ApiError.forbidden('Account deactivated'));

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return next(ApiError.unauthorized('Token expired'));
    if (err.name === 'JsonWebTokenError') return next(ApiError.unauthorized('Invalid token'));
    next(err);
  }
}

// Optional auth — attaches user if token present, does not error if absent
async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  try {
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await userRepo.findById(decoded.id, 'id role isActive');
    if (user && user.isActive) {
      req.user = { id: user._id.toString(), role: user.role };
    }
  } catch { /* ignore */ }
  next();
}

// Role-based access control factory
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`This action requires role: ${roles.join(' or ')}`));
    }
    next();
  };
}

const requireProvider = requireRole('provider', 'admin');
const requireCustomer = requireRole('customer', 'admin');
const requireAdmin = requireRole('admin');

module.exports = { authenticate, optionalAuth, requireRole, requireProvider, requireCustomer, requireAdmin };

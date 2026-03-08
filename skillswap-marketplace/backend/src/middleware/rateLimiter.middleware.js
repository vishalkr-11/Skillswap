// src/middleware/rateLimiter.middleware.js
const rateLimit = require('express-rate-limit');
const { getRedis } = require('../config/redis');

// Create a Redis-backed store if available, else memory
function makeStore(prefix) {
  const redis = getRedis();
  if (!redis) return undefined; // falls back to in-memory

  return {
    async increment(key) {
      const k = `rl:${prefix}:${key}`;
      const current = await redis.incr(k);
      if (current === 1) {
        const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000;
        await redis.pexpire(k, windowMs);
      }
      return {
        totalHits: current,
        resetTime: undefined,
      };
    },
    async decrement(key) {
      await redis.decr(`rl:${prefix}:${key}`);
    },
    async resetKey(key) {
      await redis.del(`rl:${prefix}:${key}`);
    },
  };
}

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const MAX      = parseInt(process.env.RATE_LIMIT_MAX, 10) || (process.env.NODE_ENV === 'development' ? 1000 : 200);
const AUTH_MAX = parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || (process.env.NODE_ENV === 'development' ? 50 : 15);

// Global limiter applied to all routes
const globalRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, statusCode: 429, message: 'Too many requests, please try again later.' },
  store: makeStore('global'),
  skip: (req) => req.path === '/health',
});

// Strict limiter for auth endpoints
const authRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, statusCode: 429, message: 'Too many auth attempts, please try again later.' },
  store: makeStore('auth'),
});

// Moderate limiter for AI endpoint (expensive calls)
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, statusCode: 429, message: 'AI request limit reached, please wait a moment.' },
  store: makeStore('ai'),
});

module.exports = { globalRateLimiter, authRateLimiter, aiRateLimiter };

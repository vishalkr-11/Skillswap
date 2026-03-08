// src/utils/cache.utils.js
const { getRedis } = require('../config/redis');
const logger = require('./logger');

async function cacheGet(key) {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch (err) {
    logger.warn(`Cache GET failed for ${key}: ${err.message}`);
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = 300) {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.warn(`Cache SET failed for ${key}: ${err.message}`);
  }
}

async function cacheDel(key) {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err) {
    logger.warn(`Cache DEL failed for ${key}: ${err.message}`);
  }
}

async function cacheDelPattern(pattern) {
  const redis = getRedis();
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) {
    logger.warn(`Cache DEL pattern failed for ${pattern}: ${err.message}`);
  }
}

// Decorator-style cache wrapper
async function withCache(key, ttl, fetchFn) {
  const cached = await cacheGet(key);
  if (cached !== null) return cached;
  const data = await fetchFn();
  await cacheSet(key, data, ttl);
  return data;
}

module.exports = { cacheGet, cacheSet, cacheDel, cacheDelPattern, withCache };

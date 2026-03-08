// src/config/redis.js
const Redis = require('ioredis');
const logger = require('../utils/logger');

let client = null;
let connectionFailed = false;   // stop retrying after first permanent failure

function createRedisClient() {
  const c = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    // Retry up to 3 times with short delays, then give up
    retryStrategy: (times) => {
      if (times >= 3) return null;          // null = stop retrying
      return Math.min(times * 200, 1000);
    },
    enableOfflineQueue: false,
    lazyConnect: true,
    // Suppress ioredis default reconnect behavior after we've given up
    maxRetriesPerRequest: null,
  });

  // Only log errors until we've marked connection as failed
  c.on('error', (err) => {
    if (!connectionFailed) {
      logger.warn(`Redis unavailable: ${err.message} — caching disabled`);
    }
  });

  c.on('connect', () => {
    connectionFailed = false;
    logger.info('Redis client connected');
  });

  c.on('ready',   () => logger.info('Redis client ready'));
  c.on('end',     () => logger.debug('Redis connection closed'));

  return c;
}

async function connectRedis() {
  const c = createRedisClient();
  try {
    await c.connect();
    client = c;
  } catch (err) {
    connectionFailed = true;
    logger.warn(`Redis not available (${err.message}) — running without cache`);
    // Cleanly destroy the client so it stops firing error events
    try { c.disconnect(); } catch {}
    client = null;
  }
}

function getRedis() {
  return client;
}

module.exports = { connectRedis, getRedis };

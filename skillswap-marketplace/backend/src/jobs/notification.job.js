// src/jobs/notification.job.js
const Bull = require('bull');
const logger = require('../utils/logger');

let queue = null;

function getQueue() {
  if (!queue) {
    try {
      queue = new Bull('notifications', {
        redis: {
          host: process.env.BULL_REDIS_HOST || process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.BULL_REDIS_PORT || process.env.REDIS_PORT, 10) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      });

      // ── Process jobs ────────────────────────────────
      queue.process('new_booking', async (job) => {
        const { userId, bookingId, serviceTitle } = job.data;
        // In production: send push notification / email via SendGrid etc.
        logger.info(`[NOTIFY] new_booking → user:${userId} booking:${bookingId} service:"${serviceTitle}"`);
      });

      queue.process('booking_update', async (job) => {
        const { userId, bookingId, status } = job.data;
        logger.info(`[NOTIFY] booking_update → user:${userId} booking:${bookingId} status:${status}`);
      });

      queue.process('new_message', async (job) => {
        const { userId, senderId, preview } = job.data;
        logger.info(`[NOTIFY] new_message → user:${userId} from:${senderId} "${preview}"`);
      });

      queue.on('failed', (job, err) => {
        logger.error(`[QUEUE] Job ${job.id} (${job.name}) failed:`, err.message);
      });

      queue.on('completed', (job) => {
        logger.debug(`[QUEUE] Job ${job.id} (${job.name}) completed`);
      });

      logger.info('Notification queue initialised');
    } catch (err) {
      logger.warn(`Notification queue unavailable: ${err.message}`);
      queue = null;
    }
  }
  return queue;
}

// Safe add — silently degrades if queue is not available
async function add(type, data, opts = {}) {
  try {
    const q = getQueue();
    if (q) await q.add(type, data, opts);
  } catch (err) {
    logger.warn(`[QUEUE] Failed to add job (${type}): ${err.message}`);
  }
}

module.exports = { add, getQueue };

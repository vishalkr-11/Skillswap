// ─────────────────────────────────────────────────────
//  src/app.js  —  Express Application Setup
// ─────────────────────────────────────────────────────
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const { globalRateLimiter } = require('./middleware/rateLimiter.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

// ── Route imports ────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const providerRoutes = require('./routes/provider.routes');
const serviceRoutes = require('./routes/service.routes');
const bookingRoutes = require('./routes/booking.routes');
const reviewRoutes = require('./routes/review.routes');
const messageRoutes = require('./routes/message.routes');
const aiRoutes = require('./routes/ai.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

// ── Security middleware ──────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    const allowed = (process.env.ALLOWED_ORIGINS || '').split(',');
    if (!origin || allowed.includes(origin) || process.env.NODE_ENV === 'development') {
      cb(null, true);
    } else {
      cb(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

// ── General middleware ───────────────────────────────
app.use(compression());
// AFTER:
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => {
    // Store raw body for Razorpay webhook signature verification
    req.rawBody = buf.toString('utf8');
  },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP request logger ──────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
  skip: () => process.env.NODE_ENV === 'test',
}));

// ── Global rate limiter ──────────────────────────────
app.use(globalRateLimiter);

// ── Health check ─────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── API Routes ───────────────────────────────────────
const API = '/api';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/providers`, providerRoutes);
app.use(`${API}/services`, serviceRoutes);
app.use(`${API}/bookings`, bookingRoutes);
app.use(`${API}/reviews`, reviewRoutes);
app.use(`${API}/messages`, messageRoutes);
app.use(`${API}/ai`, aiRoutes);
app.use(`${API}/payments`, paymentRoutes);


// ── 404 & error handlers ─────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

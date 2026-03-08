# SkillSwap — Peer-to-Peer Skill Exchange Marketplace

> A production-ready, full-stack marketplace where anyone can offer skills, book sessions, pay securely, and communicate in real time.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo Credentials](#live-demo-credentials)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Payment Flow](#payment-flow)
- [Real-Time System](#real-time-system)
- [Authentication & Security](#authentication--security)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Caching Strategy](#caching-strategy)
- [AI Integration](#ai-integration)

---

## Overview

SkillSwap is a two-sided marketplace where **customers** discover and book skilled **providers**, pay via an integrated Razorpay payment gateway, and communicate in real time. Providers manage their services, track bookings, and receive instant payment notifications — all without any manual intervention.

**Core user flows:**

```
Customer                                Provider
────────                                ────────
Browse providers by category            Manage services & pricing
Search by skill / location              Receive booking requests
Book a session                          Accept / reject bookings
Pay via Razorpay                  ←→    Get instant payment notification
Chat in real time                 ←→    Chat in real time
Leave a review                          View earnings dashboard
```

---

## Live Demo Credentials

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Customer | john@test.com          | Password123 |
| Customer | emma@test.com          | Password123 |
| Provider | alex@skillswap.dev     | Password123 |
| Provider | sarah@skillswap.dev    | Password123 |
| Provider | priya@skillswap.dev    | Password123 |

**Razorpay test card:** `4111 1111 1111 1111` · Any future date · Any CVV

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 4 |
| Database | MongoDB 7 + Mongoose 8 |
| Cache | Redis 7 (ioredis) |
| Real-time | Socket.io 4 |
| Auth | JWT (access + refresh tokens) |
| Payments | Razorpay |
| AI | Google Gemini 1.5 Flash |
| Queue | Bull (Redis-backed job queue) |
| Logging | Winston + daily-rotate-file |
| Security | Helmet, express-rate-limit, bcryptjs |
| Validation | express-validator |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router v6 |
| Data fetching | TanStack Query v5 |
| HTTP client | Axios |
| Styling | TailwindCSS 3 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| Real-time | Socket.io Client |

### Infrastructure
| Layer | Technology |
|---|---|
| Containerisation | Docker + Docker Compose |
| Reverse proxy | Nginx |
| Process manager | Nodemon (dev) / Node (prod) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│   Browser (React SPA)              Mobile (progressive)          │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTP + WebSocket
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NGINX (port 80 / 443)                       │
│   /api/* → backend:5000          /* → frontend static files      │
└───────────────────────┬─────────────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│  BACKEND API    │         │   FRONTEND      │
│  Express + WS   │         │   Vite / Nginx  │
│  port 5000      │         │   port 3000     │
└────────┬────────┘         └─────────────────┘
         │
    ┌────┴─────────────────┐
    │                      │
    ▼                      ▼
┌────────────┐     ┌───────────────┐
│  MongoDB   │     │    Redis      │
│  port 27017│     │  port 6379    │
│  (persist) │     │  (cache+queue)│
└────────────┘     └───────────────┘
         │
         ▼
┌─────────────────┐
│   Razorpay API  │  (external — server-side only)
│   Google Gemini │  (external — server-side only)
└─────────────────┘
```

### Request lifecycle

```
Browser → Nginx → Express middleware stack → Route → Controller → Service → Repository → MongoDB
                                                                                ↕
                                                                              Redis cache
```

### Socket.io rooms

Each connected user automatically joins two rooms:
- `user:<userId>` — personal room for directed notifications
- `chat:<chatId>` — conversation room (joined on demand)

---

## Project Structure

```
skillswap-marketplace/
├── docker-compose.yml
├── start.sh
│
├── backend/
│   ├── server.js               # HTTP server + Socket.io init
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   ├── scripts/
│   │   └── seed.js             # Database seeder
│   └── src/
│       ├── app.js              # Express app setup
│       ├── config/
│       │   ├── redis.js        # Redis connection
│       │   └── socket.js       # Socket.io server + event handlers
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── provider.controller.js
│       │   ├── service.controller.js
│       │   ├── booking.controller.js
│       │   ├── payment.controller.js
│       │   ├── message.controller.js
│       │   ├── review.controller.js
│       │   └── ai.controller.js
│       ├── services/
│       │   ├── auth.service.js
│       │   ├── provider.service.js
│       │   ├── service.service.js
│       │   ├── booking.service.js
│       │   ├── payment.service.js
│       │   ├── message.service.js
│       │   └── review.service.js
│       ├── repositories/
│       │   ├── user.repository.js
│       │   ├── service.repository.js
│       │   ├── booking.repository.js
│       │   ├── message.repository.js
│       │   └── review.repository.js
│       ├── models/
│       │   ├── user.model.js
│       │   ├── service.model.js
│       │   ├── booking.model.js
│       │   ├── payment.model.js
│       │   ├── message.model.js
│       │   └── review.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── provider.routes.js
│       │   ├── service.routes.js
│       │   ├── booking.routes.js
│       │   ├── payment.routes.js
│       │   ├── message.routes.js
│       │   ├── review.routes.js
│       │   └── ai.routes.js
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   ├── error.middleware.js
│       │   ├── rateLimiter.middleware.js
│       │   ├── validate.middleware.js
│       │   └── verifyWebhook.middleware.js
│       ├── validators/
│       │   ├── auth.validator.js
│       │   ├── booking.validator.js
│       │   └── message.validator.js
│       ├── utils/
│       │   ├── response.utils.js
│       │   ├── jwt.utils.js
│       │   ├── cache.utils.js
│       │   └── logger.js
│       └── jobs/
│           └── notification.job.js
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/
        │   ├── AuthContext.jsx      # Auth state + token management
        │   └── SocketContext.jsx    # Socket.io connection + events
        ├── hooks/
        │   ├── useApi.js            # All React Query hooks
        │   └── useUtils.js          # useDebounce, etc.
        ├── services/
        │   ├── api.js               # Axios instance + token refresh
        │   └── index.js             # All service functions
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── ExplorePage.jsx
        │   ├── ProviderProfilePage.jsx
        │   ├── BookingPage.jsx
        │   ├── MessagingPage.jsx
        │   ├── CustomerDashboard.jsx
        │   ├── ProviderDashboard.jsx
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   ├── ForgotPasswordPage.jsx
        │   ├── PricingPage.jsx
        │   ├── AboutPage.jsx
        │   └── ...
        ├── components/
        │   ├── common/
        │   │   ├── Avatar.jsx
        │   │   ├── ProviderCard.jsx
        │   │   ├── Navbar.jsx
        │   │   └── Footer.jsx
        │   └── payment/
        │       └── PaymentButton.jsx
        └── utils/
            └── helpers.js
```

---

## Features

### Authentication
- JWT access tokens (7-day expiry) + refresh tokens (30-day expiry)
- Token auto-refresh queue — concurrent requests during refresh are queued, not cancelled
- bcrypt password hashing (10 rounds)
- Role-based access control: `customer`, `provider`, `admin`
- Auth state persisted in localStorage, cleared on logout

### Provider Discovery
- Browse by category (coding, design, tutoring, fitness, music, photography, cooking, language, business, plumbing)
- Full-text search across provider names and skills (debounced, 400ms)
- Category filter joins via Services collection — providers are matched by what they actually offer
- Sort by rating, price (asc/desc), reviews, newest
- URL-driven filter state — shareable and bookmarkable links
- Provider profile with rating, bio, services list, reviews, availability

### Booking System
- Time-slot conflict detection per provider
- Booking status machine: `pending → confirmed → in_progress → completed / cancelled / rejected`
- Status history audit trail (who changed what, when, with optional note)
- Role-enforced actions: providers can confirm/reject/complete; customers can only cancel
- Auto-creates a shared chat room ID (`sort([customerId, providerId]).join('_')`)

### Payment (Razorpay)
- Server-side order creation — secret key never exposed to the browser
- HMAC-SHA256 signature verification on every payment
- Idempotent verification — duplicate callbacks are safely ignored
- Booking auto-confirms when payment is verified
- Webhook handler for async payment events (captured, failed, refunded)
- Raw body preserved for webhook signature verification

### Real-Time Messaging
- Socket.io rooms: `user:<id>` (personal) + `chat:<chatId>` (conversation)
- JWT-authenticated WebSocket connections
- Typing indicators with auto-clear timeout
- Optimistic message rendering with rollback on failure
- Unread message count tracking
- Chat partner correctly derived from populated `senderId` + `receiverId` (not re-parsed from chatId string)
- Provider receives `bookingConfirmed` push event on payment success

### Provider Dashboard
- Booking list with status badges and history
- Earnings summary
- Service management (add/edit/delete services)
- Real-time booking notifications via socket

### AI Recommendations (Google Gemini)
- Natural language skill matching
- Analyzes user request and returns ranked provider matches with explanations
- Runs server-side — API key never in frontend

### Caching
- Redis cache on provider list and individual provider queries (5-minute TTL)
- Cache invalidated on profile update
- Graceful fallback — Redis failure never breaks the API

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ✗ | Create account (`name`, `email`, `password`, `role`) |
| POST | `/login` | ✗ | Login → returns `accessToken` + `refreshToken` |
| POST | `/refresh` | ✗ | Refresh access token |
| POST | `/logout` | ✓ | Invalidate refresh token |
| GET | `/me` | ✓ | Get current user profile |
| POST | `/forgot-password` | ✗ | Send password reset email (always returns 200) |

### Providers — `/api/providers`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✗ | List providers — params: `category`, `q`, `sort`, `page`, `limit`, `city` |
| GET | `/:id` | ✗ | Get single provider with services and rating stats |
| PATCH | `/profile` | Provider | Update own profile |
| GET | `/nearby` | ✗ | Geo-search — params: `lat`, `lng`, `radius`, `skill` |

### Services — `/api/services`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✗ | List services with filters |
| GET | `/:id` | ✗ | Get single service |
| POST | `/` | Provider | Create a service |
| PUT | `/:id` | Provider | Update a service |
| DELETE | `/:id` | Provider | Delete a service |

### Bookings — `/api/bookings`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Customer | Create booking → status `pending`, paymentStatus `unpaid` |
| GET | `/user` | Customer | Customer's own bookings |
| GET | `/provider` | Provider | Provider's bookings |
| PATCH | `/:id/status` | Both | Update status (role-restricted actions) |

### Payments — `/api/payments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create-order` | Customer | Create Razorpay order for a booking — returns `orderId`, `amount`, `keyId` |
| POST | `/verify` | Customer | Verify HMAC signature → confirms booking |
| POST | `/webhook` | None (sig verified) | Razorpay webhook handler |

### Messages — `/api/messages`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/chats` | ✓ | All conversation threads with partner info and unread count |
| GET | `/:chatId` | ✓ | Message history for a conversation (paginated) |
| POST | `/` | ✓ | Send a message (`receiverId`, `content`) |
| GET | `/unread` | ✓ | Total unread message count |

### Reviews — `/api/reviews`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Customer | Create review for a completed booking |
| GET | `/provider/:id` | ✗ | All reviews for a provider |
| POST | `/:id/reply` | Provider | Reply to a review |

### AI — `/api/ai`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/recommend` | ✓ | Get AI-matched providers from natural language query |

---

## Database Schema

### User
```
_id, name, email, password (hashed), role, avatar, bio,
location: { type, coordinates, city, state, country },
skillsOffered: [String],
availability: [{ day, startTime, endTime, isAvailable }],
rating: { average, count },
isVerified, isActive, refreshToken,
createdAt, updatedAt
```

### Service
```
_id, providerId → User, title, description,
category (coding|design|tutoring|fitness|music|plumbing|cooking|photography|language|business|...),
tags: [String],
pricing: { type (fixed|hourly|negotiable), amount, currency },
location: { coordinates, city, ... },
isRemote, isActive,
rating: { average, count }, totalBookings,
slug (unique), createdAt, updatedAt
```

### Booking
```
_id, serviceId → Service, providerId → User, customerId → User,
timeSlot: { date, startTime, endTime, duration },
status (pending|confirmed|in_progress|completed|cancelled|rejected),
statusHistory: [{ status, changedBy, note, at }],
price: { amount, currency },
notes, address, chatId,
paymentStatus (unpaid|pending|paid|refunded),
razorpayOrderId, razorpayPaymentId,
isReviewed, cancellationReason,
createdAt, updatedAt
```

### Payment
```
_id, bookingId → Booking, userId → User,
amount (in smallest unit — paise/cents),
currency, gateway,
orderId (Razorpay order ID — unique),
paymentId (Razorpay payment ID — set after checkout),
signature (HMAC-SHA256 — stored for audit),
status (created|paid|failed|refunded),
metadata, createdAt, updatedAt
```

### Message
```
_id, chatId (String — sorted userId pair joined by _),
senderId → User, receiverId → User,
content, type (text|image|file|booking_ref),
attachmentUrl, isRead, readAt, isDeleted,
createdAt, updatedAt
```

### Review
```
_id, bookingId → Booking, providerId → User, customerId → User,
rating (1–5), comment, reply: { text, at },
isVisible, createdAt, updatedAt
```

---

## Payment Flow

```
1. Customer clicks "Book Now" on a provider profile
         │
         ▼
2. POST /api/bookings
   → Booking created: status=pending, paymentStatus=unpaid
         │
         ▼
3. Booking page shows "Complete Payment" screen
         │
         ▼
4. Customer clicks "Pay via Razorpay"
   → PaymentButton.jsx calls POST /api/payments/create-order
   → Backend creates Razorpay order (server-side, secret key never in browser)
   → Returns { orderId, amount, currency, keyId }
         │
         ▼
5. Razorpay checkout modal opens in browser
   → Customer enters card / UPI / netbanking
         │
         ▼
6. Razorpay fires handler({ razorpay_order_id, razorpay_payment_id, razorpay_signature })
         │
         ▼
7. Frontend calls POST /api/payments/verify
   → Backend reconstructs HMAC-SHA256: SHA256(orderId + "|" + paymentId, RAZORPAY_SECRET)
   → Compares with received signature — rejects on mismatch
   → Payment record: status = paid
   → Booking: status = confirmed, paymentStatus = paid
         │
         ▼
8. Socket.io emits bookingConfirmed to provider's personal room
   → Provider sees real-time toast: "💰 Payment received — booking confirmed!"
         │
         ▼
9. Customer is redirected to dashboard
```

### Webhook (backup path)
Razorpay can also POST to `/api/payments/webhook` for async events. The `verifyRazorpayWebhook` middleware verifies the `X-Razorpay-Signature` header against the raw request body using `RAZORPAY_WEBHOOK_SECRET` before any processing occurs.

---

## Real-Time System

### Connection lifecycle

```
Client connects → JWT verified in Socket.io auth middleware
→ socket.join("user:<userId>")        personal notifications room
→ onlineUsers Map updated             userId → Set of socketIds
→ socket.broadcast.emit("user_online")
```

### Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_chat` | Client → Server | `{ chatId }` |
| `leave_chat` | Client → Server | `{ chatId }` |
| `typing` | Client → Server | `{ chatId, receiverId }` |
| `stop_typing` | Client → Server | `{ chatId, receiverId }` |
| `new_message` | Server → Client | `{ message, chatId }` |
| `user_typing` | Server → Client | `{ chatId, senderId }` |
| `user_stop_typing` | Server → Client | `{ chatId, senderId }` |
| `user_online` | Server → All | `{ userId }` |
| `user_offline` | Server → All | `{ userId }` |
| `new_booking` | Server → Provider | `{ bookingId, service, timeSlot }` |
| `booking_update` | Server → Client/Provider | `{ bookingId, status }` |
| `bookingConfirmed` | Server → Provider | `{ bookingId, serviceTitle, customerName, amount }` |

### Chat ID algorithm
Both frontend and backend use the same deterministic formula:
```js
chatId = [userId1, userId2].sort().join('_')
```
This guarantees the same chatId regardless of who initiates the conversation.

---

## Authentication & Security

### JWT Strategy
- **Access token** — short-lived (7 days), sent in `Authorization: Bearer` header
- **Refresh token** — long-lived (30 days), stored in database, used to issue new access tokens
- Token refresh is queued on the frontend — if 10 requests all get a 401 simultaneously, only one refresh call is made; the others wait and retry

### Middleware stack (per request)
```
Helmet (security headers)
→ CORS (origin whitelist from ALLOWED_ORIGINS env)
→ express.json (body parse + rawBody capture for webhooks)
→ Morgan (HTTP logging)
→ Global rate limiter (1000 req/15min in dev, 100 in prod)
→ Route-specific auth middleware
→ Role guard (requireCustomer / requireProvider)
→ Input validation (express-validator)
→ Controller
→ Error handler (globalises all thrown ApiErrors)
```

### Rate limiting
- Global: 1000 requests / 15-minute window (dev) — 100 (prod)
- Auth routes: 50 requests / 15 minutes
- AI routes: separate stricter limiter

### Input validation
All mutating endpoints run `express-validator` rule chains before reaching the controller. Validation failures return structured 400 errors:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "receiverId", "message": "receiverId must be a valid ID" }]
}
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 7 (local or Atlas)
- Redis 7
- npm or yarn

### Local development (without Docker)

```bash
# 1. Clone and install dependencies
git clone <repo-url>
cd skillswap-marketplace

# Backend
cd backend
cp .env.example .env        # fill in your values
npm install
npm run seed                # seed test data
npm run dev                 # starts on :5000

# Frontend (new terminal)
cd ../frontend
cp .env.example .env
npm install
npm run dev                 # starts on :5173
```

### Seed accounts created by `npm run seed`
Running the seeder creates all the test accounts listed in the [Live Demo Credentials](#live-demo-credentials) section, along with sample services in each category.

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/skill-exchange

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRES_IN=30d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=50

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Logging
LOG_LEVEL=debug
LOG_DIR=logs

# Cache TTL (seconds)
CACHE_TTL_PROVIDERS=300
CACHE_TTL_SERVICES=300

# Bull Queue
BULL_REDIS_HOST=localhost
BULL_REDIS_PORT=6379
```

### Where to get your Razorpay keys
1. Sign up at [razorpay.com](https://razorpay.com) — free test account
2. Dashboard → Settings → API Keys → Generate Test Key
3. Dashboard → Webhooks → Add URL → copy the secret

---

## Docker Deployment

```bash
# Build and start all services
docker compose up --build

# Run in background
docker compose up -d

# Seed the database
docker compose exec backend npm run seed

# View logs
docker compose logs -f backend

# Stop everything
docker compose down

# Stop and remove volumes (wipes database)
docker compose down -v
```

### Services started by Docker Compose

| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| skillswap-mongo | mongo:7 | 27017 | Primary database |
| skillswap-redis | redis:7-alpine | 6379 | Cache + job queue |
| skillswap-backend | (local build) | 5000 | API + Socket.io |
| skillswap-frontend | (local build) | 3000 | React SPA via Nginx |

Backend waits for MongoDB and Redis health checks before starting.

---

## Caching Strategy

Redis caching is applied at the service layer using a `withCache(key, ttl, fn)` utility:

| Cache key pattern | TTL | Invalidated when |
|---|---|---|
| `providers:list:<params>` | 5 min | — (time-based expiry) |
| `providers:<id>` | 5 min | Provider updates their profile |

If Redis is unavailable, `withCache` falls through to the database — the API never fails due to cache errors.

---

## AI Integration

The `/api/ai/recommend` endpoint accepts a free-text query describing what the user wants to learn or needs help with. The backend:

1. Fetches the current list of active providers and their services from the database
2. Sends the provider data + user query to Google Gemini 1.5 Flash
3. Instructs the model to return ranked matches with natural-language explanations
4. Returns the response to the frontend

The Gemini API key is **server-side only** — it was removed from the frontend `.env` entirely to prevent exposure.

---

## Response Format

All API responses follow this envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Providers fetched",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Provider not found",
  "errors": []
}
```

---

## Frontend Routes

| Path | Component | Auth required |
|------|-----------|---------------|
| `/` | LandingPage | No |
| `/explore` | ExplorePage | No |
| `/explore?category=design` | ExplorePage (filtered) | No |
| `/providers/:id` | ProviderProfilePage | No |
| `/book/:providerId` | BookingPage | Customer |
| `/dashboard` | CustomerDashboard | Customer |
| `/provider-dashboard` | ProviderDashboard | Provider |
| `/messages` | MessagingPage | ✓ |
| `/messages/:chatId` | MessagingPage (pre-selected) | ✓ |
| `/login` | LoginPage | No |
| `/signup` | SignupPage | No |
| `/forgot-password` | ForgotPasswordPage | No |
| `/pricing` | PricingPage | No |
| `/about` | AboutPage | No |
| `/privacy` | PrivacyPage | No |
| `/terms` | TermsPage | No |

---

*Built for the Hackathon — production-ready architecture, real payments, real time.*
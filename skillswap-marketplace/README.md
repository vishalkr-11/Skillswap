# ⚡ SkillSwap Marketplace — Production Ready Full Stack

A complete skill-exchange marketplace connecting customers with local service providers.

**Stack:** React 18 + Vite · Node.js/Express · MongoDB · Redis · Socket.io · Gemini AI

---

## 🏗️ Architecture

```
skillswap-marketplace/
├── backend/                     Node.js + Express REST API
│   ├── src/
│   │   ├── config/              db.js, redis.js, socket.js
│   │   ├── controllers/         auth, provider, service, booking, review, message, ai
│   │   ├── middleware/          auth, error, rateLimiter, validate
│   │   ├── models/              User, Service, Booking, Review, Message
│   │   ├── repositories/        Data access layer
│   │   ├── routes/              Express routers
│   │   ├── services/            Business logic
│   │   ├── utils/               jwt, response, cache, logger
│   │   └── validators/          express-validator rules
│   └── scripts/
│       └── seed.js              Database seeder
├── frontend/                    React + Vite SPA
│   └── src/
│       ├── components/          Avatar, Navbar, ProviderCard, AIAssistant, ReviewForm
│       ├── context/             AuthContext, SocketContext
│       ├── hooks/               useApi (React Query), useUtils
│       ├── pages/               Login, Signup, Explore, Provider Profile, Booking, Dashboard, Messages
│       ├── services/            Axios API client + endpoints
│       └── utils/               helpers, normalizeProvider
├── docker-compose.yml
└── start.sh                     One-command local dev launcher
```

---

## 🚀 Quick Start — Local (Recommended)

```bash
# 1. Clone / extract the project
# 2. Run:
./start.sh
```

This will:
- Copy `.env.example` files
- Install all dependencies
- Seed MongoDB with test providers, customers, bookings, and messages
- Launch backend on **:5000** and frontend on **:5173**

### Manual Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env
# ⚠️ Edit .env — required values:
#   MONGO_URI=mongodb://localhost:27017/skill-exchange
#   JWT_SECRET=any_long_random_32_char_string
#   JWT_REFRESH_SECRET=another_long_random_string
#   GEMINI_API_KEY=your_google_gemini_key   (for AI assistant)
npm run seed    # populate test data
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🐳 Docker

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT_SECRET, JWT_REFRESH_SECRET, GEMINI_API_KEY

docker-compose up -d
# Frontend → http://localhost:3000
# Backend  → http://localhost:5000
```

---

## 📧 Test Credentials (after seeding)

| Role     | Email                   | Password    |
|----------|-------------------------|-------------|
| Provider | alex@skillswap.dev      | Password123 |
| Provider | sarah@skillswap.dev     | Password123 |
| Provider | marcus@skillswap.dev    | Password123 |
| Provider | priya@skillswap.dev     | Password123 |
| Provider | james@skillswap.dev     | Password123 |
| Provider | maria@skillswap.dev     | Password123 |
| Customer | john@test.com           | Password123 |
| Customer | emma@test.com           | Password123 |
| Customer | mike@test.com           | Password123 |

---

## 🔌 API Endpoints

| Method | Path                          | Auth | Description                  |
|--------|-------------------------------|------|------------------------------|
| POST   | /api/auth/register            | —    | Sign up                      |
| POST   | /api/auth/login               | —    | Sign in → accessToken        |
| POST   | /api/auth/refresh             | —    | Refresh JWT                  |
| POST   | /api/auth/logout              | ✓    | Invalidate token             |
| GET    | /api/auth/me                  | ✓    | Current user                 |
| GET    | /api/providers                | —    | List/search providers        |
| GET    | /api/providers/:id            | —    | Provider profile + services  |
| PATCH  | /api/providers/profile        | ✓    | Update own profile           |
| GET    | /api/services                 | —    | List services                |
| POST   | /api/services                 | ✓    | Create service (provider)    |
| POST   | /api/bookings                 | ✓    | Create booking (customer)    |
| GET    | /api/bookings/user            | ✓    | Customer's bookings          |
| GET    | /api/bookings/provider        | ✓    | Provider's bookings          |
| PATCH  | /api/bookings/:id/status      | ✓    | Accept/decline/cancel        |
| GET    | /api/reviews/provider/:id     | —    | Provider reviews             |
| POST   | /api/reviews                  | ✓    | Submit review                |
| GET    | /api/messages/chats           | ✓    | Chat list                    |
| GET    | /api/messages/:chatId         | ✓    | Chat history                 |
| POST   | /api/messages                 | ✓    | Send message                 |
| POST   | /api/ai/recommend             | —    | AI provider recommendations  |
| GET    | /health                       | —    | Health check                 |

---

## 🔄 Real-time Socket Events

| Event              | Direction        | Payload                        |
|--------------------|------------------|--------------------------------|
| `join_chat`        | Client → Server  | `{ chatId }`                   |
| `leave_chat`       | Client → Server  | `{ chatId }`                   |
| `typing`           | Client → Server  | `{ chatId, receiverId }`       |
| `stop_typing`      | Client → Server  | `{ chatId, receiverId }`       |
| `new_message`      | Server → Client  | `{ message, chatId }`          |
| `user_typing`      | Server → Client  | `{ chatId, senderId }`         |
| `user_stop_typing` | Server → Client  | `{ chatId, senderId }`         |
| `new_booking`      | Server → Client  | `{ bookingId, service, ... }`  |
| `booking_update`   | Server → Client  | `{ bookingId, status, ... }`   |
| `user_online`      | Server → Client  | `{ userId }`                   |
| `user_offline`     | Server → Client  | `{ userId }`                   |

---

## 🤖 AI Assistant

The AI assistant (floating button, bottom-right) uses a three-tier fallback:
1. **Backend Gemini** (`/api/ai/recommend`) — enriched with real service catalogue
2. **Direct Gemini** (client-side, requires `VITE_GEMINI_API_KEY`) — conversation mode
3. **Static fallback** — shows mock providers, always works

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable              | Required | Description                            |
|-----------------------|----------|----------------------------------------|
| `MONGO_URI`           | ✅        | MongoDB connection string              |
| `JWT_SECRET`          | ✅        | Access token signing secret (32+ chars)|
| `JWT_REFRESH_SECRET`  | ✅        | Refresh token secret                   |
| `GEMINI_API_KEY`      | Optional | Google Gemini key for AI recommendations|
| `REDIS_HOST`          | Optional | Redis host (caching, omit to skip)     |
| `PORT`                | Optional | API port (default 5000)                |

### Frontend (`frontend/.env`)

| Variable              | Required | Description                            |
|-----------------------|----------|----------------------------------------|
| `VITE_API_BASE_URL`   | Optional | Backend URL (default localhost:5000/api)|
| `VITE_SOCKET_URL`     | Optional | Socket.io URL (default localhost:5000) |
| `VITE_GEMINI_API_KEY` | Optional | Direct Gemini key (AI chat fallback)   |

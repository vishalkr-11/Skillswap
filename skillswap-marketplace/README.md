⚡ SkillSwap — AI-Powered Skill Exchange Marketplace

The smartest way to connect, collaborate, and grow.

Node.js React MongoDB Firebase Gemini AI License



SkillSwap is a full-stack, production-grade marketplace platform that enables customers to discover, book, and communicate with top-rated skill providers — powered by a Google Gemini AI recommendation engine, real-time Firebase messaging, and a secure Node.js REST API backend.



✨ Core Features

🤖 AI-Powered Recommendations

Integrated Google Gemini 1.5 Flash for natural language provider matching

Context-aware prompting: sends the user's requirement, budget, location, and a live catalogue of services to the AI

Returns structured JSON with match scores (0-100), reasoning, and key highlights per recommendation

Production-grade algorithmic fallback: if the AI API is unavailable, an intelligent keyword-scoring engine takes over — users always get results

⚡ Real-Time Messaging (Firebase)

Firebase Firestore onSnapshot listener for zero-latency message delivery

Dual-channel architecture: messages saved to both Firebase (real-time sync) AND MongoDB (persistence)

Live typing indicators synced through Firestore

Smart deterministic chatId generation (userId_providerId)

"New Conversation" modal with live provider search from real database

🔐 Secure JWT Authentication

Access + Refresh token pair strategy (7d / 30d expiry)

bcryptjs password hashing with 12 salt rounds

Protected routes on both frontend (React Router guards) and backend (Express middleware)

Auto token-refresh interceptor in Axios — silent re-authentication

🏪 Full Provider Marketplace

Multi-dimensional search: full-text, category, location, price range, availability

Server-side pagination with cursor-safe metadata

Mongoose 2dsphere geospatial indexes for proximity-based search

Redis-backed caching (300s TTL providers, 120s reviews)

📅 Booking Engine

14-day rolling calendar with interactive time slot grid

Live service price + 5% platform fee in real-time

Full booking lifecycle: pending → confirmed → completed → cancelled

Dedicated dashboards for Customers (sessions, spend history) and Providers (earnings, reviews)

🎨 Premium UI/UX

Vanta.js NET animated background — purple particle network reacts to mouse

Glassmorphism design (backdrop-blur, translucent cards)

Caveat cursive branding, Inter body text, JetBrains Mono for code

Framer Motion — spring-physics page transitions + skeleton loaders

Fully responsive — mobile-first at every component

🏗️ Architecture

skillswap-marketplace/

├── backend/                    # Node.js + Express REST API

│   └── src/

│       ├── controllers/        # HTTP handlers (thin, no logic)

│       │   ├── auth.controller.js

│       │   ├── provider.controller.js

│       │   ├── booking.controller.js

│       │   ├── message.controller.js

│       │   └── ai.controller.js        ← Gemini AI endpoint

│       ├── services/           # Business logic layer

│       │   ├── ai.service.js           ← Gemini + Algorithmic Fallback

│       │   ├── provider.service.js     ← Listing, normalization, caching

│       │   ├── booking.service.js

│       │   └── message.service.js

│       ├── repositories/       # Data access only (Mongoose queries)

│       ├── models/             # Mongoose schemas

│       │   ├── user.model.js           ← Customers + Providers

│       │   ├── service.model.js        ← Provider offerings

│       │   ├── booking.model.js

│       │   ├── message.model.js

│       │   └── review.model.js

│       ├── middleware/

│       │   ├── auth.middleware.js      ← JWT verify

│       │   ├── rateLimiter.middleware.js

│       │   └── validate.middleware.js

│       └── utils/

│           ├── cache.utils.js          ← Redis withCache / cacheDel

│           ├── response.utils.js       ← ApiError + sendResponse

│           └── logger.js               ← Winston structured logging

│

└── frontend/                   # React 18 + Vite SPA

    └── src/

        ├── pages/

        │   ├── LandingPage.jsx         ← Hero, categories, featured providers

        │   ├── ExplorePage.jsx         ← Search + filter + sort

        │   ├── ProviderProfilePage.jsx

        │   ├── BookingPage.jsx         ← 2-step booking wizard

        │   ├── MessagingPage.jsx       ← Firebase real-time chat

        │   ├── CustomerDashboard.jsx

        │   └── ProviderDashboard.jsx

        ├── components/

        │   ├── ai/AIAssistant.jsx      ← Floating Gemini chatbot

        │   └── common/                 ← Navbar, Footer, ProviderCard, Avatar

        ├── context/

        │   ├── AuthContext.jsx         ← Global auth state + JWT lifecycle

        │   └── SocketContext.jsx       ← Socket.IO provider

        ├── hooks/useApi.js             ← All React Query hooks

        ├── services/api.js             ← Axios + interceptors + auto-refresh

        └── config/firebase.js          ← Firebase app init

🛠️ Tech Stack

Backend

Technology	Role

Node.js v22 + Express.js	REST API Server

MongoDB Atlas + Mongoose	Primary Database + ODM

Redis (ioredis)	Response Caching Layer

Firebase Admin SDK	Real-time Firestore access

Google Gemini AI	Natural Language Recommendations

JWT + bcryptjs	Auth & Password Security

Socket.IO	WebSocket Server

Winston	Structured Logging

express-validator	Strict Input Validation

Frontend

Technology	Role

React 18 + Vite 5	UI Framework + Build Tool

React Router v6	Client-side Routing

TanStack React Query	Server State + Caching

Firebase (Firestore)	Real-Time Messaging

Framer Motion	Animations & Transitions

Axios	HTTP Client + Auto-Refresh

Vanta.js + Three.js	3D Animated Background

lucide-react	Icon Library

📡 API Reference

Authentication

POST   /api/auth/register         Register as customer or provider

POST   /api/auth/login            Login + receive access/refresh JWT pair

POST   /api/auth/refresh          Silent token refresh

GET    /api/auth/me               Get current user

Providers

GET    /api/providers             List providers

                                  Supports: ?q= ?category= ?sort= ?page= ?minPrice= ?maxPrice=

GET    /api/providers/:id         Single provider + services + reviews

PUT    /api/providers/:id         Update profile (protected)

Bookings

POST   /api/bookings              Create booking

GET    /api/bookings              My bookings (customer or provider view)

PATCH  /api/bookings/:id/status   Confirm / complete / cancel

Messages

GET    /api/messages/chats        All chat threads for current user

GET    /api/messages/:chatId      Message history

POST   /api/messages              Send message

AI Endpoint (Public — No Auth Required)

POST   /api/ai/recommend

Body: {

  "requirement": "I need a React developer",  // required, min 5 chars

  "budget":   "$50-$100/hr",                  // optional

  "location": "San Francisco",                // optional

  "category": "technology"                    // optional

}

⚙️ Setup & Installation

Prerequisites

Node.js v18+

MongoDB Atlas (free tier works)

Firebase project with Firestore enabled

Google Gemini API key (optional — falls back to algorithmic matching if absent)

1. Clone the repo

git clone https://github.com/your-username/skillswap-marketplace.git

cd skillswap-marketplace

2. Backend setup

cd backend

npm install

cp .env.example .env   # Fill in your values (see below)

npm run dev            # Starts at http://localhost:5000

3. Seed the database

node seed.js   # Creates 6 real provider accounts with services

4. Frontend setup

cd frontend

npm install

# Create .env with VITE_API_BASE_URL and Firebase keys

npm run dev    # Starts at http://localhost:5173

Environment Variables (Backend .env)

NODE_ENV=development

PORT=5000

MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/skill-exchange

JWT_SECRET=your_super_strong_secret_min_32_chars

JWT_EXPIRES_IN=7d

JWT_REFRESH_SECRET=your_refresh_secret

JWT_REFRESH_EXPIRES_IN=30d

REDIS_HOST=localhost

REDIS_PORT=6379

GEMINI_API_KEY=your_gemini_api_key

GEMINI_MODEL=gemini-1.5-flash

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

CACHE_TTL_PROVIDERS=300

CACHE_TTL_REVIEWS=120

🔑 Key Engineering Decisions

1. Strict Layered Architecture

HTTP Request → Controller (parse/respond) → Service (business logic) → Repository (DB query)

Each layer is pure and has one job. Changing the database doesn't touch services. Changing business logic doesn't touch routes. Independently testable by design.



2. AI with Algorithmic Fallback — Zero Blank Screens

POST /api/ai/recommend never returns a 500 to the user. If Gemini API fails (network error, quota, invalid key), the service automatically runs a keyword-frequency scoring algorithm on the live services catalogue and returns ranked, enriched results in milliseconds.



3. Dual-Channel Messaging (Speed + Durability)

[Send Message]

     │

     ├──► Firebase Firestore addDoc()   → onSnapshot() on recipient = instant delivery

     │

     └──► POST /api/messages → MongoDB  → Persistent history + REST access

4. normalizeProvider() — One Transformation, Every Boundary

The MongoDB schema (skillsOffered, rating.average) and React component props (skills, rating) don't align. A shared normalizeProvider() function transforms data at every API and component boundary. One change propagates everywhere. No mismatches, no defensive null-checks scattered across the codebase.



5. Redis Cache Strategy

Provider listings are expensive (joins across users, services, reviews). Responses are cached under a query-parameter-derived key. cacheDel is called on every write. Result: near-instant repeat reads, dramatic reduction in Atlas I/O.



📊 Data Models

User

{

  name, email, password,           // bcrypt hashed

  role: 'customer' | 'provider',

  bio, avatar,

  skillsOffered: [String],

  rating: { average, count },

  location: {

    type: 'Point', coordinates, city, state, country

  },

  availability: [{ day, slots }],

  isVerified, isActive, lastSeen

}

Service

{

  providerId,                      // ref: User

  title, description,

  category: 'technology' | 'design' | 'tutoring' | 'fitness' | 'other',

  pricing: { amount, currency, type: 'fixed' | 'hourly' | 'negotiable' },

  tags, isRemote, isActive,

  rating: { average, count },

  slug                             // auto-generated, unique

}

Booking

{

  customerId, providerId,          // refs: User

  serviceId,                       // ref: Service

  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',

  timeSlot: { date, startTime, endTime },

  totalAmount, notes

}

🧪 Test the AI Endpoint

node -e "

  fetch('http://localhost:5000/api/ai/recommend', {

    method: 'POST',

    headers: { 'Content-Type': 'application/json' },

    body: JSON.stringify({

      requirement: 'I need a React developer to build my startup MVP'

    })

  }).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))

"

Sample response:



{

  "success": true,

  "data": {

    "recommendations": [

      {

        "rank": 1,

        "title": "React Development Session",

        "provider": "Alex Chen",

        "price": "85 USD/fixed",

        "matchScore": 95,

        "reasoning": "Alex specializes in full-stack React and Node.js with 8 years of industry experience...",

        "highlights": ["8 years experience", "4.9 ⭐ rating", "127 verified reviews"]

      }

    ],

    "summary": "Here are your top-matched React developers..."

  }

}

🚀 Production Readiness Checklist

 npm run build — Vite production bundle compiles with zero errors

 All mock data removed from frontend — 100% real database

 All secrets in environment variables — nothing hardcoded

 Rate limiting on all routes (100 req/15min, 10 for auth)

 CORS restricted to allowed origins only

 Redis caching live on provider listings

 AI endpoint never crashes — algorithmic fallback always returns data

 Firebase Firestore security rules configured

 Mongoose 2dsphere + full-text indexes active

 All empty states handled — no blank screens anywhere in the user flow

👨‍💻 About This Project

This platform was engineered from scratch as a complete, production-standard full-stack system covering:



✅ Distributed architecture (REST + WebSocket + Firebase real-time)

✅ AI/ML integration with graceful, production-safe degradation

✅ Secure authentication with refresh token rotation

✅ Scalable database design (indexes, caching, pagination)

✅ Premium, fully responsive UI with advanced animations

✅ Real-world SEO, accessibility, and performance patterns

Every feature is functional. Every design decision was deliberate. Every line of code was written with production quality in mind.



Built with ❤️ using React, Node.js, MongoDB, Firebase & Google Gemini AI



⭐ Star this re

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

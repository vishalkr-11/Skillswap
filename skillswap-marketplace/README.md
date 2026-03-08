<div align="center">

# ⚡ SkillSwap — AI-Powered Skill Exchange Marketplace

### *The smartest way to connect, collaborate, and grow.*

[![Node.js](https://img.shields.io/badge/Node.js-v22-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI%20Powered-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-a855f7?style=flat-square)](LICENSE)

> **SkillSwap** is a full-stack, production-grade marketplace platform that enables customers to discover, book, and communicate with top-rated skill providers — powered by a **Google Gemini AI** recommendation engine, **real-time Firebase** messaging, and a secure **Node.js REST API** backend.

---

</div>

## ✨ Core Features

### 🤖 AI-Powered Recommendations
- Integrated **Google Gemini 1.5 Flash** for natural language provider matching
- Context-aware prompting: sends the user's requirement, budget, location, and a live catalogue of services to the AI
- Returns structured JSON with match scores (0-100), reasoning, and key highlights per recommendation
- **Production-grade algorithmic fallback**: if the AI API is unavailable, an intelligent keyword-scoring engine takes over — users *always* get results

### ⚡ Real-Time Messaging (Firebase)
- Firebase Firestore `onSnapshot` listener for zero-latency message delivery
- **Dual-channel architecture**: messages saved to both Firebase (real-time sync) AND MongoDB (persistence)
- Live **typing indicators** synced through Firestore
- Smart deterministic `chatId` generation (`userId_providerId`)
- "New Conversation" modal with live provider search from real database

### 🔐 Secure JWT Authentication
- **Access + Refresh token** pair strategy (7d / 30d expiry)
- `bcryptjs` password hashing with 12 salt rounds
- Protected routes on **both** frontend (React Router guards) and backend (Express middleware)
- **Auto token-refresh interceptor** in Axios — silent re-authentication

### 🏪 Full Provider Marketplace
- Multi-dimensional search: full-text, category, location, price range, availability
- Server-side pagination with cursor-safe metadata
- Mongoose `2dsphere` geospatial indexes for proximity-based search
- **Redis-backed caching** (300s TTL providers, 120s reviews)

### 📅 Booking Engine
- 14-day rolling calendar with interactive time slot grid
- Live service price + 5% platform fee in real-time
- Full booking lifecycle: `pending → confirmed → completed → cancelled`
- Dedicated dashboards for **Customers** (sessions, spend history) and **Providers** (earnings, reviews)

### 🎨 Premium UI/UX
- **Vanta.js NET** animated background — purple particle network reacts to mouse
- Glassmorphism design (`backdrop-blur`, translucent cards)
- **Caveat** cursive branding, **Inter** body text, **JetBrains Mono** for code
- **Framer Motion** — spring-physics page transitions + skeleton loaders
- Fully responsive — mobile-first at every component

---

## 🏗️ Architecture

```
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
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Role |
|---|---|
| **Node.js v22 + Express.js** | REST API Server |
| **MongoDB Atlas + Mongoose** | Primary Database + ODM |
| **Redis (ioredis)** | Response Caching Layer |
| **Firebase Admin SDK** | Real-time Firestore access |
| **Google Gemini AI** | Natural Language Recommendations |
| **JWT + bcryptjs** | Auth & Password Security |
| **Socket.IO** | WebSocket Server |
| **Winston** | Structured Logging |
| **express-validator** | Strict Input Validation |

### Frontend
| Technology | Role |
|---|---|
| **React 18 + Vite 5** | UI Framework + Build Tool |
| **React Router v6** | Client-side Routing |
| **TanStack React Query** | Server State + Caching |
| **Firebase (Firestore)** | Real-Time Messaging |
| **Framer Motion** | Animations & Transitions |
| **Axios** | HTTP Client + Auto-Refresh |
| **Vanta.js + Three.js** | 3D Animated Background |
| **lucide-react** | Icon Library |

---

## 📡 API Reference

### Authentication
```
POST   /api/auth/register         Register as customer or provider
POST   /api/auth/login            Login + receive access/refresh JWT pair
POST   /api/auth/refresh          Silent token refresh
GET    /api/auth/me               Get current user
```

### Providers
```
GET    /api/providers             List providers
                                  Supports: ?q= ?category= ?sort= ?page= ?minPrice= ?maxPrice=
GET    /api/providers/:id         Single provider + services + reviews
PUT    /api/providers/:id         Update profile (protected)
```

### Bookings
```
POST   /api/bookings              Create booking
GET    /api/bookings              My bookings (customer or provider view)
PATCH  /api/bookings/:id/status   Confirm / complete / cancel
```

### Messages
```
GET    /api/messages/chats        All chat threads for current user
GET    /api/messages/:chatId      Message history
POST   /api/messages              Send message
```

### AI Endpoint (Public — No Auth Required)
```
POST   /api/ai/recommend
Body: {
  "requirement": "I need a React developer",  // required, min 5 chars
  "budget":   "$50-$100/hr",                  // optional
  "location": "San Francisco",                // optional
  "category": "technology"                    // optional
}
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas (free tier works)
- Firebase project with Firestore enabled
- Google Gemini API key (optional — falls back to algorithmic matching if absent)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/skillswap-marketplace.git
cd skillswap-marketplace
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env   # Fill in your values (see below)
npm run dev            # Starts at http://localhost:5000
```

### 3. Seed the database
```bash
node seed.js   # Creates 6 real provider accounts with services
```

### 4. Frontend setup
```bash
cd frontend
npm install
# Create .env with VITE_API_BASE_URL and Firebase keys
npm run dev    # Starts at http://localhost:5173
```

### Environment Variables (Backend `.env`)
```env
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
```

---

## 🔑 Key Engineering Decisions

### 1. Strict Layered Architecture
```
HTTP Request → Controller (parse/respond) → Service (business logic) → Repository (DB query)
```
Each layer is pure and has **one job**. Changing the database doesn't touch services. Changing business logic doesn't touch routes. Independently testable by design.

### 2. AI with Algorithmic Fallback — Zero Blank Screens
`POST /api/ai/recommend` **never** returns a 500 to the user. If Gemini API fails (network error, quota, invalid key), the service automatically runs a **keyword-frequency scoring algorithm** on the live services catalogue and returns ranked, enriched results in milliseconds.

### 3. Dual-Channel Messaging (Speed + Durability)
```
[Send Message]
     │
     ├──► Firebase Firestore addDoc()   → onSnapshot() on recipient = instant delivery
     │
     └──► POST /api/messages → MongoDB  → Persistent history + REST access
```

### 4. `normalizeProvider()` — One Transformation, Every Boundary
The MongoDB schema (`skillsOffered`, `rating.average`) and React component props (`skills`, `rating`) don't align. A shared `normalizeProvider()` function transforms data at every API and component boundary. One change propagates everywhere. No mismatches, no defensive null-checks scattered across the codebase.

### 5. Redis Cache Strategy
Provider listings are expensive (joins across `users`, `services`, `reviews`). Responses are cached under a query-parameter-derived key. `cacheDel` is called on every write. Result: near-instant repeat reads, dramatic reduction in Atlas I/O.

---

## 📊 Data Models

### User
```js
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
```

### Service
```js
{
  providerId,                      // ref: User
  title, description,
  category: 'technology' | 'design' | 'tutoring' | 'fitness' | 'other',
  pricing: { amount, currency, type: 'fixed' | 'hourly' | 'negotiable' },
  tags, isRemote, isActive,
  rating: { average, count },
  slug                             // auto-generated, unique
}
```

### Booking
```js
{
  customerId, providerId,          // refs: User
  serviceId,                       // ref: Service
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  timeSlot: { date, startTime, endTime },
  totalAmount, notes
}
```

---

## 🧪 Test the AI Endpoint

```bash
node -e "
  fetch('http://localhost:5000/api/ai/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requirement: 'I need a React developer to build my startup MVP'
    })
  }).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))
"
```

**Sample response:**
```json
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
```

---

## 🚀 Production Readiness Checklist

- [x] `npm run build` — Vite production bundle compiles with zero errors
- [x] All mock data removed from frontend — 100% real database
- [x] All secrets in environment variables — nothing hardcoded
- [x] Rate limiting on all routes (100 req/15min, 10 for auth)
- [x] CORS restricted to allowed origins only
- [x] Redis caching live on provider listings
- [x] AI endpoint never crashes — algorithmic fallback always returns data
- [x] Firebase Firestore security rules configured
- [x] Mongoose `2dsphere` + full-text indexes active
- [x] All empty states handled — no blank screens anywhere in the user flow

---

## 👨‍💻 About This Project

This platform was engineered from scratch as a complete, **production-standard** full-stack system covering:

- ✅ Distributed architecture (REST + WebSocket + Firebase real-time)
- ✅ AI/ML integration with graceful, production-safe degradation
- ✅ Secure authentication with refresh token rotation
- ✅ Scalable database design (indexes, caching, pagination)
- ✅ Premium, fully responsive UI with advanced animations
- ✅ Real-world SEO, accessibility, and performance patterns

Every feature is **functional**. Every design decision was **deliberate**. Every line of code was written with **production quality** in mind.

---

<div align="center">

Built with ❤️ using **React**, **Node.js**, **MongoDB**, **Firebase** & **Google Gemini AI**

⭐ **Star this repo if it impressed you!** ⭐

</div>

# SkillSwap Marketplace — Frontend

A production-ready frontend for a local skill-exchange marketplace platform, connecting customers with local service providers.

## 🚀 Tech Stack

- **React 18** + **Vite 5**
- **TailwindCSS** — utility-first styling with glassmorphism design
- **Framer Motion** — smooth animations and transitions
- **React Query v5** — server state management with optimistic updates
- **React Router v6** — client-side routing
- **Axios** — HTTP client with interceptors
- **Socket.io-client** — real-time messaging
- **Google Gemini API** — AI assistant integration
- **PWA-ready** via vite-plugin-pwa

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ai/           # AIAssistant (Gemini-powered)
│   ├── common/       # Navbar, Footer, Avatar, SearchBar, ProviderCard, StarRating, Loaders
│   └── review/       # ReviewForm
├── context/
│   ├── AuthContext.jsx    # JWT auth state
│   └── SocketContext.jsx  # Socket.io connection
├── hooks/
│   ├── useApi.js     # React Query hooks for all API calls
│   └── useUtils.js   # useDebounce, useIntersectionObserver, etc.
├── layouts/
│   ├── MainLayout.jsx
│   └── AuthLayout.jsx
├── pages/
│   ├── LandingPage.jsx
│   ├── ExplorePage.jsx
│   ├── ProviderProfilePage.jsx
│   ├── BookingPage.jsx
│   ├── CustomerDashboard.jsx
│   ├── ProviderDashboard.jsx
│   ├── MessagingPage.jsx
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   └── NotFoundPage.jsx
├── services/
│   ├── api.js           # Axios instance + interceptors
│   ├── authService.js
│   ├── geminiService.js # Gemini API integration
│   └── index.js         # All service exports
├── utils/
│   └── helpers.js    # Formatting, constants, mock data
├── App.jsx
├── main.jsx
└── index.css         # Global styles + design tokens
```

---

## ⚙️ Setup Instructions

### 1. Clone and install

```bash
cd skillswap
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Get Gemini API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to get a free API key.

### 3. Run the development server

```bash
npm run dev
```

Open http://localhost:5173

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## 🔑 API Contract

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login |
| GET | /providers | List providers |
| GET | /providers/:id | Provider details |
| GET | /services | List services |
| POST | /services | Create service |
| POST | /bookings | Create booking |
| GET | /bookings/user | User bookings |
| GET | /bookings/provider | Provider bookings |
| POST | /reviews | Submit review |
| GET | /reviews/provider/:id | Provider reviews |
| GET | /messages/:chatId | Get messages |
| POST | /messages | Send message |
| POST | /ai/recommend | AI recommendations |

---

## 🎨 Features

### Customer
- 🔍 Search and filter providers by skill, category, location, price
- 👤 View detailed provider profiles with reviews
- 📅 Book sessions with date/time selection
- 💬 Real-time chat with providers (Socket.io)
- 🤖 AI assistant for finding the right provider (Gemini)
- ⭐ Leave reviews and ratings
- 📊 Dashboard with booking management

### Provider
- 📋 Dashboard with booking requests (accept/decline)
- 💰 Earnings summary
- 📈 Profile stats and reviews
- 📅 Calendar view of bookings
- 💬 Real-time messaging

### Design
- 🌙 Dark mode glassmorphism UI
- ✨ Smooth Framer Motion animations
- 📱 Mobile-first responsive design
- 💀 Skeleton loaders
- 🔄 Optimistic UI updates
- ♾️ Infinite scroll ready
- 🤳 PWA-ready

---

## 🔌 Real-time Features (Socket.io)

The app connects to Socket.io server automatically when authenticated. Events:
- `join_chat` / `leave_chat` — join messaging rooms
- `send_message` / `receive_message` — real-time messaging
- `typing` — typing indicators
- `notification` — booking notifications
- `online_users` — online presence

---

## 📝 Demo Mode

The app runs in **demo mode** without a backend:
- Login/signup works with any credentials
- Mock providers and bookings are shown
- AI assistant falls back to local suggestions if Gemini key is missing

---

## 🛠️ Scripts

```bash
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

#!/bin/bash
# start.sh — one command to launch SkillSwap locally

set -e
echo "🛠️  SkillSwap Marketplace — Starting..."
echo ""

# Check Node
if ! command -v node &>/dev/null; then
  echo "❌ Node.js not found. Install Node.js >= 18."
  exit 1
fi

# Setup backend env
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "⚠️  Created backend/.env — please set JWT_SECRET, JWT_REFRESH_SECRET, GEMINI_API_KEY, MONGO_URI"
fi

# Setup frontend env
if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
  echo "✅ Created frontend/.env (defaults to localhost:5000)"
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install --silent
echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install --silent
cd ..

# Create required dirs
mkdir -p backend/logs backend/uploads

echo ""
echo "🌱 Seeding database with test data..."
cd backend && node scripts/seed.js
cd ..

echo ""
echo "🚀 Starting backend on http://localhost:5000 ..."
cd backend && npm run dev &
BACKEND_PID=$!

sleep 2

echo "🚀 Starting frontend on http://localhost:5173 ..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both services running!"
echo "   Frontend  → http://localhost:5173"
echo "   Backend   → http://localhost:5000"
echo "   Health    → http://localhost:5000/health"
echo ""
echo "📧 Test credentials:"
echo "   Providers: alex@skillswap.dev / sarah@skillswap.dev (password: Password123)"
echo "   Customers: john@test.com / emma@test.com (password: Password123)"
echo ""
echo "Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" SIGINT SIGTERM
wait

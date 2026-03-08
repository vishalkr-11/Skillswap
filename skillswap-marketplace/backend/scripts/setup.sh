#!/bin/bash
# scripts/setup.sh — One-command local setup

set -e

echo "🛠️  Skill Exchange Backend — Local Setup"
echo "======================================="

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install Node.js >= 18 first."
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required (found v$NODE_VERSION)"
  exit 1
fi

echo "✅ Node.js $(node -v) found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Copy .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ .env created from .env.example"
  echo "⚠️  Edit .env to set MONGO_URI, JWT_SECRET, GEMINI_API_KEY"
else
  echo "ℹ️  .env already exists, skipping"
fi

# Create directories
mkdir -p logs uploads
echo "✅ logs/ and uploads/ directories created"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the server:"
echo "  npm run dev       # development with nodemon"
echo "  npm start         # production"
echo ""
echo "To start with Docker:"
echo "  docker-compose up -d"

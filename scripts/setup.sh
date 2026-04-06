#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Setting up me-feels (Linux/macOS)..."

# Check dependencies
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }

# Copy env file if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example — update with your actual values!"
fi

# Install service dependencies
echo "📦 Installing service dependencies..."
(cd service && npm install)

# Install web dependencies
echo "📦 Installing web dependencies..."
(cd web && npm install)

echo ""
echo "✅ Setup complete!"
echo "   Run './scripts/start.sh' to start the development environment."

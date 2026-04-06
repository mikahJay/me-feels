#!/usr/bin/env bash
set -euo pipefail

echo "▶️  Starting me-feels dev environment..."
docker compose up --build -d

echo ""
echo "✅ Services started:"
echo "   🌐 Web:     http://localhost:3000"
echo "   🔧 Service: http://localhost:3001"
echo "   🐘 DB:      localhost:5432"
echo ""
echo "Run 'docker compose logs -f' to stream logs."
echo "Run 'docker compose down' to stop."

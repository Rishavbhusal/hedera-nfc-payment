#!/bin/bash
# Restart script for dev server and ngrok

set -e

echo "🔄 Restarting TapThat X development server..."

# Kill existing processes
echo "Stopping existing servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
pkill -f "ngrok http" 2>/dev/null || true

sleep 2

# Navigate to project
cd "$(dirname "$0")"
export PATH="$HOME/.local/bin:$PATH"

echo ""
echo "✅ Old processes stopped"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Start the dev server (Terminal 1):"
echo "   cd /home/atos-mv/Desktop/TAP-TO_PAY/tap-that-x"
echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
echo "   yarn start"
echo ""
echo "2. Wait for: '> Ready on http://localhost:3000'"
echo ""
echo "3. Start ngrok (Terminal 2):"
echo "   ngrok http 3000"
echo ""
echo "4. Use the HTTPS URL from ngrok on your mobile device"
echo ""










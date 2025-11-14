#!/bin/bash
# Complete restart script - fixes ERR_NGROK_3200

echo "🔄 Restarting everything..."

# Kill all processes
echo "Stopping old processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
pkill -f "ngrok http" 2>/dev/null
sleep 2

echo "✅ All processes stopped"
echo ""
echo "📋 Now follow these steps:"
echo ""
echo "1. Start server (Terminal 1):"
echo "   cd /home/atos-mv/Desktop/TAP-TO_PAY/tap-that-x"
echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
echo "   yarn start"
echo ""
echo "2. WAIT for: '> Ready on http://localhost:3000'"
echo ""
echo "3. Test server works:"
echo "   curl http://localhost:3000"
echo "   (Should return HTML)"
echo ""
echo "4. Start ngrok (Terminal 2):"
echo "   ngrok http 3000"
echo ""
echo "5. Copy the NEW HTTPS URL from ngrok"
echo "   (It will be different from abc123.ngrok.io)"
echo ""
echo "6. Use that NEW URL on your mobile device"
echo ""









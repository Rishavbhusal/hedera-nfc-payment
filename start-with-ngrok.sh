#!/bin/bash
# Start server and ngrok together

cd "$(dirname "$0")"
export PATH="$HOME/.local/bin:$PATH"

echo "🔄 Stopping existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
pkill -f "ngrok http" 2>/dev/null
sleep 2

echo "🚀 Starting dev server..."
cd packages/nextjs
yarn dev > /tmp/tapthat-server.log 2>&1 &
SERVER_PID=$!

echo "⏳ Waiting for server to start (this may take 30-60 seconds)..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Server is ready!"
        break
    fi
    echo "   Waiting... ($i/30)"
    sleep 2
done

if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Server failed to start. Check /tmp/tapthat-server.log"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo ""
echo "📋 Server is running on http://localhost:3000"
echo ""
echo "🌐 Now starting ngrok..."
echo "   (This will open in a new terminal window)"
echo ""

# Start ngrok in new terminal if xterm is available
if command -v xterm &> /dev/null; then
    xterm -e "ngrok http 3000; read -p 'Press Enter to close...'" &
elif command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "ngrok http 3000; read -p 'Press Enter to close...'" &
else
    echo "⚠️  Cannot open new terminal. Please run this manually:"
    echo "   ngrok http 3000"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📱 Next steps:"
echo "   1. Wait for ngrok to show the HTTPS URL"
echo "   2. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)"
echo "   3. Use that URL on your mobile device"
echo ""
echo "📊 Check server logs: tail -f /tmp/tapthat-server.log"
echo "📊 Check ngrok status: http://127.0.0.1:4040"
echo ""
echo "Press Ctrl+C to stop everything"
wait $SERVER_PID

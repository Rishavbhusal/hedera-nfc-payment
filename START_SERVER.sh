#!/bin/bash
# Start script for dev server

cd "$(dirname "$0")"
export PATH="$HOME/.local/bin:$PATH"

echo "🚀 Starting TapThat X development server..."
echo ""
echo "Please wait for: '> Ready on http://localhost:3000'"
echo ""
echo "After server is ready, open a NEW terminal and run:"
echo "  ngrok http 3000"
echo ""

yarn start










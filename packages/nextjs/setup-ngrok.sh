#!/bin/bash
# Setup ngrok for Web NFC (requires valid domain)

set -e

echo "🌐 Setting up ngrok for Web NFC access..."
echo ""
echo "Web NFC API requires a valid domain name (not IP address)."
echo "ngrok provides a real HTTPS domain that works with Web NFC."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing ngrok..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Download ngrok for Linux
        curl -O https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
        tar -xzf ngrok-v3-stable-linux-amd64.tgz
        sudo mv ngrok /usr/local/bin/
        rm ngrok-v3-stable-linux-amd64.tgz
        echo "✅ ngrok installed"
    else
        echo "❌ Please install ngrok manually: https://ngrok.com/download"
        exit 1
    fi
fi

echo ""
echo "✅ ngrok is installed"
echo ""
echo "📋 Next steps:"
echo "   1. Sign up for free ngrok account: https://dashboard.ngrok.com/signup"
echo "   2. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken"
echo "   3. Run: ngrok config add-authtoken YOUR_TOKEN"
echo "   4. Start your dev server: yarn start"
echo "   5. In another terminal, run: ngrok http 3000"
echo "   6. Use the ngrok HTTPS URL on your mobile device"
echo ""
echo "Example:"
echo "   ngrok http 3000"
echo "   # Will show: https://abc123.ngrok.io"
echo "   # Use this URL on your mobile device"










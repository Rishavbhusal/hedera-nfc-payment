#!/bin/bash
# Setup HTTPS certificates for development server
# This enables Web NFC API which requires HTTPS

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="$SCRIPT_DIR/certs"

echo "🔐 Setting up HTTPS certificates for TapThat X..."

# Get local IP address
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || ip addr show | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}' | cut -d'/' -f1)

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Could not detect local IP address"
    exit 1
fi

echo "📍 Detected local IP: $LOCAL_IP"

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "📦 Installing mkcert..."
    
    # Check if we're on Linux
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Install mkcert on Linux
        if command -v apt-get &> /dev/null; then
            echo "Installing via apt-get..."
            sudo apt-get update
            sudo apt-get install -y libnss3-tools
            # Download mkcert
            curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
            chmod +x mkcert-v*-linux-amd64
            sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
        elif command -v yum &> /dev/null; then
            echo "Installing via yum..."
            sudo yum install -y nss-tools
            curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
            chmod +x mkcert-v*-linux-amd64
            sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
        else
            echo "❌ Please install mkcert manually: https://github.com/FiloSottile/mkcert"
            exit 1
        fi
    else
        echo "❌ Please install mkcert manually: https://github.com/FiloSottile/mkcert"
        exit 1
    fi
fi

echo "✅ mkcert is installed"

# Install local CA
echo "🔑 Installing local CA..."
mkcert -install

# Create certs directory
mkdir -p "$CERTS_DIR"

# Generate certificates
echo "📜 Generating certificates for localhost, 127.0.0.1, ::1, and $LOCAL_IP..."
echo "⚠️  Note: Web NFC requires a valid domain name, not IP address."
echo "   For mobile access, consider using ngrok instead (see WEB_NFC_SETUP.md)"
cd "$CERTS_DIR"
mkcert localhost 127.0.0.1 ::1 "$LOCAL_IP"

echo ""
echo "✅ HTTPS certificates generated successfully!"
echo ""
echo "📱 Your mobile access URL will be:"
echo "   https://$LOCAL_IP:3000"
echo ""
echo "⚠️  On your mobile device, you may need to:"
echo "   1. Accept the security warning (self-signed certificate)"
echo "   2. Trust the certificate in your browser settings"
echo ""
echo "🚀 Restart your dev server to use HTTPS:"
echo "   yarn start"


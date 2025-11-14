# ✅ Verify HTTPS Server

## If Your Server Uses HTTPS

If you set up HTTPS certificates, use these commands:

### Test HTTPS Server

```bash
# Test HTTPS (ignore certificate warnings with -k)
curl -k https://localhost:3000

# Or test in browser:
# https://localhost:3000
```

### Check if Server is Using HTTPS

```bash
# Check if certificates exist
ls -la packages/nextjs/certs/*.pem

# If certificates exist, server uses HTTPS
# If no certificates, server uses HTTP
```

### Test Both Protocols

```bash
# Test HTTPS
curl -k https://localhost:3000

# Test HTTP (if HTTPS fails)
curl http://localhost:3000
```

## ngrok Configuration

**Important:** ngrok always forwards to HTTP by default:

```bash
ngrok http 3000
```

This forwards: `https://abc123.ngrok.io -> http://localhost:3000`

**If your server uses HTTPS**, you need to tell ngrok:

```bash
ngrok http https://localhost:3000
```

Or:

```bash
ngrok http 3000 --scheme=https
```

## Complete Verification

```bash
# 1. Check if certificates exist
ls packages/nextjs/certs/*.pem 2>/dev/null && echo "Using HTTPS" || echo "Using HTTP"

# 2. Test server
# If HTTPS:
curl -k https://localhost:3000
# If HTTP:
curl http://localhost:3000

# 3. Start ngrok
# If server uses HTTPS:
ngrok http https://localhost:3000
# If server uses HTTP:
ngrok http 3000

# 4. Use the HTTPS URL from ngrok on mobile
```

## Quick Test Script

```bash
#!/bin/bash

# Check protocol
if [ -f "packages/nextjs/certs/"*.pem ]; then
    echo "🔒 Server uses HTTPS"
    PROTOCOL="https"
    CURL_OPTS="-k"
else
    echo "🔓 Server uses HTTP"
    PROTOCOL="http"
    CURL_OPTS=""
fi

# Test server
echo "Testing ${PROTOCOL}://localhost:3000..."
if curl $CURL_OPTS -s ${PROTOCOL}://localhost:3000 > /dev/null; then
    echo "✅ Server is responding!"
else
    echo "❌ Server is NOT responding"
fi
```









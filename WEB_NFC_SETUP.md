# 🔐 Web NFC Setup Guide

## The Problem

Web NFC API requires:
1. ✅ **HTTPS** (secure context)
2. ✅ **Valid domain name** (not IP address)

Accessing via `https://192.168.1.244:3000` will fail with:
```
SecurityError: The effective domain of the document is not a valid domain
```

## Solutions

### Option 1: Use ngrok (Recommended - Easiest)

ngrok provides a real HTTPS domain that works perfectly with Web NFC.

#### Setup:

1. **Install ngrok:**
   ```bash
   cd /home/atos-mv/Desktop/TAP-TO_PAY/tap-that-x/packages/nextjs
   ./setup-ngrok.sh
   ```

2. **Sign up and get authtoken:**
   - Go to: https://dashboard.ngrok.com/signup
   - Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
   - Run: `ngrok config add-authtoken YOUR_TOKEN`

3. **Start your dev server:**
   ```bash
   cd /home/atos-mv/Desktop/TAP-TO_PAY/tap-that-x
   export PATH="$HOME/.local/bin:$PATH"
   yarn start
   ```

4. **Start ngrok in another terminal:**
   ```bash
   ngrok http 3000
   ```

5. **Use the ngrok URL on mobile:**
   - ngrok will show: `https://abc123.ngrok.io`
   - Open this URL on your mobile device
   - Web NFC will work! ✅

**Pros:**
- ✅ Works immediately
- ✅ Real HTTPS domain
- ✅ No local network configuration needed
- ✅ Works from anywhere

**Cons:**
- ⚠️ Free tier has session limits
- ⚠️ URL changes each time (unless you pay)

---

### Option 2: Use Local Domain Name

Set up a local domain name that resolves to your IP.

#### On Linux (hosts file):

1. **Edit hosts file:**
   ```bash
   sudo nano /etc/hosts
   ```

2. **Add this line:**
   ```
   192.168.1.244  tapthat.local
   ```

3. **Update certificate to include domain:**
   ```bash
   cd /home/atos-mv/Desktop/TAP-TO_PAY/tap-that-x/packages/nextjs/certs
   mkcert tapthat.local 192.168.1.244
   ```

4. **Update server.mjs to use the domain in certificate lookup**

5. **On mobile device:**
   - You'll need to configure DNS or use a hosts file editor
   - Or use a local DNS server

**Pros:**
- ✅ Permanent solution
- ✅ No external service needed

**Cons:**
- ⚠️ Requires configuration on both devices
- ⚠️ More complex setup

---

### Option 3: Use localhost with Port Forwarding (Android)

If you have Android, you can use ADB port forwarding:

1. **Enable USB debugging** on your Android device
2. **Connect via USB**
3. **Forward port:**
   ```bash
   adb reverse tcp:3000 tcp:3000
   ```
4. **Access via:** `https://localhost:3000` on your mobile browser

**Pros:**
- ✅ Uses localhost (always valid domain)
- ✅ No external service

**Cons:**
- ⚠️ Requires USB connection
- ⚠️ Only works with Android
- ⚠️ Still need HTTPS certificates

---

## Quick Start (ngrok - Recommended)

```bash
# 1. Install ngrok
cd /home/atos-mv/Desktop/TAP-TO_PAY/tap-that-x/packages/nextjs
./setup-ngrok.sh

# 2. Get authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_TOKEN

# 3. Start dev server (terminal 1)
cd /home/atos-mv/Desktop/TAP-TO_PAY/tap-that-x
export PATH="$HOME/.local/bin:$PATH"
yarn start

# 4. Start ngrok (terminal 2)
ngrok http 3000

# 5. Use the ngrok HTTPS URL on your mobile device
# Example: https://abc123.ngrok.io
```

## Testing

Once set up:
1. Open the HTTPS URL on your mobile device
2. Go to `/register` page
3. Click "Start Registration"
4. Web NFC should work without domain errors! ✅

## Troubleshooting

### Still getting domain error?
- Make sure you're using the **HTTPS** URL (not HTTP)
- Make sure the URL is a **domain name** (not IP address)
- Clear browser cache and try again

### ngrok connection issues?
- Check your internet connection
- Verify authtoken is correct: `ngrok config check`
- Try restarting ngrok

### Certificate warnings?
- For ngrok: The certificate is valid, just accept it
- For local: You may need to trust the certificate on mobile










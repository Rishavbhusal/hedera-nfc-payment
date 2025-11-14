# 📱 Running TapThat X on Mobile for NFC Detection

## Quick Setup Guide

### Prerequisites

1. **Android device** (recommended) - Web NFC works best on Android Chrome
2. **Same WiFi network** - Your laptop and mobile must be on the same network
3. **HaLo NFC chip** - Physical NFC chip for testing

### Step 1: Start the Development Server

From the project root:

```bash
cd /home/atos-mv/Desktop/TAP-TO_PAY/tap-that-x
export PATH="$HOME/.local/bin:$PATH"  # If using local yarn
yarn start
```

The server will now show your local IP address in the terminal output, like:
```
> 📱 Mobile access: http://192.168.1.100:3000
```

### Step 2: Find Your Computer's IP Address

If you need to find it manually:

**On Linux:**
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
# OR
hostname -I
```

**On Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
```

### Step 3: Access from Mobile Browser

1. **Open Chrome** on your Android device (Web NFC requires Chrome)
2. **Navigate to**: `http://YOUR_IP_ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`
3. **Connect your wallet** (MetaMask, etc.)
4. **Switch to testnet** (Base Sepolia or Sepolia)

### Step 4: Enable NFC on Your Phone

1. **Settings** → **Connected devices** → **NFC** → **Turn ON**
2. Make sure **NFC** is enabled in your phone settings
3. **Chrome** will automatically request NFC permission when you try to use it

### Step 5: Test NFC Detection

1. Go to `/register` page on your mobile browser
2. Click "Start Registration"
3. **Hold your phone near the HaLo NFC chip**
4. The app should detect the chip and prompt for authorization

## Important Notes

### Web NFC Requirements

- ✅ **Android Chrome** - Full support
- ⚠️ **iOS Safari** - Limited support (may require special browser)
- ❌ **Desktop browsers** - No Web NFC support (use mobile only)

### Network Requirements

- Both devices must be on the **same WiFi network**
- Make sure your **firewall allows connections** on port 3000
- If connection fails, try disabling firewall temporarily

### Troubleshooting

#### Can't connect from mobile

1. **Check IP address** - Make sure you're using the correct IP
2. **Check firewall** - Allow port 3000:
   ```bash
   sudo ufw allow 3000/tcp
   ```
3. **Check network** - Ensure both devices are on same WiFi
4. **Try different browser** - Use Chrome on Android

#### NFC not working

1. **Enable NFC** in phone settings
2. **Grant permissions** - Chrome will ask for NFC permission
3. **Use Chrome** - Other browsers may not support Web NFC
4. **Check chip** - Make sure HaLo chip is powered and working
5. **Hold close** - Keep phone very close to chip (within 1-2cm)

#### "exports is not defined" error

This should be fixed, but if you see it:
1. Clear browser cache
2. Restart dev server
3. Hard refresh on mobile (Chrome menu → Settings → Clear browsing data)

### Alternative: Use ngrok for External Access

If same-network access doesn't work, use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server first
yarn start

# In another terminal, create tunnel
ngrok http 3000
```

Then use the ngrok URL (e.g., `https://abc123.ngrok.io`) on your mobile.

### Testing Without NFC Chip

You can test the UI without a physical chip by:
1. Using mock addresses in the code
2. Testing on desktop first to verify wallet connections
3. Using the `/debug` page to interact with contracts

## Security Notes

⚠️ **Development Only**: The HTTP server is for development. For production:
- Use HTTPS (required for Web NFC in production)
- Deploy to a proper hosting service (Vercel, Railway, etc.)
- Use environment variables for sensitive data

## Next Steps

Once you can access the app on mobile:

1. **Register your chip** - Go to `/register` and follow the flow
2. **Approve tokens** - Go to `/approve` to set up spending limits
3. **Configure actions** - Go to `/configure` to set up tap actions
4. **Execute** - Go to `/execute` to test tap-to-pay

## Need Help?

- Check browser console on mobile (Chrome → Menu → More tools → Remote debugging)
- Check server logs in terminal
- Verify Web NFC is supported: Visit `chrome://flags` and search for "NFC"











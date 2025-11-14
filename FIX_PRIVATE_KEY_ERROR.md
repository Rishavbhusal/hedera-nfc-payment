# 🔧 Fix "Invalid Private Key Expected Uint8Array" Error

## ✅ What Was Fixed

I've added **private key validation and normalization** to fix the "invalid private key expected ui8a of size 32 got string" error.

### Changes Made:

1. **Private Key Validation**: The `RELAYER_PRIVATE_KEY` environment variable is now validated before use
2. **Format Normalization**: Private keys are automatically normalized (trimmed, 0x prefix added if missing)
3. **Clear Error Messages**: If the private key is invalid, you'll see exactly what's wrong

---

## 🎯 How to Fix

### Step 1: Check Your Environment Variable

The `RELAYER_PRIVATE_KEY` must be set in your environment. Check if it exists:

**For local development:**
```bash
# Check if it's set
echo $RELAYER_PRIVATE_KEY

# Or check .env.local file
cat packages/nextjs/.env.local | grep RELAYER_PRIVATE_KEY
```

### Step 2: Set the Private Key Correctly

The private key must be:
- **64 hex characters** (32 bytes)
- **Start with `0x`** (or it will be added automatically)
- **No extra whitespace** (automatically trimmed)

**Correct format:**
```
RELAYER_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**Wrong formats:**
```
# Missing 0x (will be auto-added, but better to include it)
RELAYER_PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Wrong length (must be exactly 64 hex chars)
RELAYER_PRIVATE_KEY=0x1234567890abcdef

# Has spaces (will be trimmed, but avoid)
RELAYER_PRIVATE_KEY= 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef 
```

### Step 3: Set the Environment Variable

**Option A: Create/Update `.env.local` file**

Create or edit `packages/nextjs/.env.local`:

```bash
cd packages/nextjs
echo "RELAYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE" >> .env.local
```

**Option B: Export in terminal (temporary)**

```bash
export RELAYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

**Option C: For production (Vercel/Railway/etc.)**

Add `RELAYER_PRIVATE_KEY` in your platform's environment variables settings.

---

## 🔍 Generate a New Private Key (If Needed)

If you don't have a relayer private key, you can generate one:

**Using Node.js:**
```bash
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**Using Foundry:**
```bash
cast wallet new
```

**Using a wallet:**
- Create a new wallet in MetaMask or any wallet
- Export the private key
- Use that as `RELAYER_PRIVATE_KEY`

---

## ⚠️ Important Security Notes

1. **Never commit private keys to git** - Always use `.env.local` or environment variables
2. **Use a separate wallet** - Don't use your main wallet's private key
3. **Fund the relayer wallet** - The relayer needs ETH to pay for gas
4. **Keep it secret** - Never share your private key

---

## ✅ Verification

After setting the environment variable:

1. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   cd packages/nextjs
   yarn dev
   ```

2. **Try executing a tap:**
   - Go to `/execute` page
   - Click "Execute Tap"
   - The error should be gone!

---

## 🔄 If Error Still Persists

### Check 1: Environment Variable is Loaded

The error message will now tell you if:
- The variable is not set: "RELAYER_PRIVATE_KEY environment variable is not set"
- The format is wrong: "Invalid RELAYER_PRIVATE_KEY format. Expected 0x followed by 64 hex characters, got X characters."

### Check 2: Server Restart

**Important:** After setting the environment variable, you MUST restart the Next.js dev server for it to pick up the new value.

```bash
# Stop server (Ctrl+C)
# Restart
cd packages/nextjs
yarn dev
```

### Check 3: Private Key Format

Verify your private key:
- Starts with `0x`
- Exactly 66 characters total (`0x` + 64 hex chars)
- No spaces or newlines
- Valid hex characters (0-9, a-f, A-F)

### Check 4: Check Server Logs

Look at your server console for the exact error message. The new validation will tell you exactly what's wrong.

---

## 📝 Example .env.local File

Create `packages/nextjs/.env.local`:

```env
# Relayer private key for gasless transactions
# Generate with: node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
RELAYER_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Optional: Alchemy API key
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key_here
```

---

## 🚀 After Fixing

Once the private key is set correctly:

1. **Restart the dev server**
2. **Go to `/execute` page**
3. **Click "Execute Tap"**
4. **Tap your chip twice**
5. **Transaction executes successfully!**

The error should now be completely resolved! 🎉



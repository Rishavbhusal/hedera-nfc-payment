# 📝 Step-by-Step: Configure Your Chip

## ✅ Prerequisites (Check These First!)

1. **Chip Registered** ✅ (You did this!)
2. **Wallet Connected** ✅ (You have this!)
3. **Token Approved** ✅ (You approved USDC/WETH)

## 🎯 Step-by-Step Configuration

### Step 1: Go to Configure Page
Navigate to `/configure` (or click "Configure" in navigation)

### Step 2: Select Your Chip
**Important:** You MUST select a chip from the dropdown!

- Look for the "Select Chip" dropdown
- Click it and choose your registered chip
- You should see something like: `0x742d...584d`

**⚠️ If dropdown is empty:** Your chip isn't registered. Go to `/register` first.

---

### Step 3: Fill in ALL Required Fields

**For ERC20 Transfer (most common):**

#### Field 1: Token Address
**What to do:**
- Click the "Use MockUSDC" button/link
- OR manually enter: `0xb090ae6dd89b25d1b79718853c439d1354bf62c5`

**How to verify it's filled:**
- You should see the address in the input field
- You might see a green checkmark showing "18 decimals" or "6 decimals"

#### Field 2: Recipient Address
**What to do:**
- Enter a valid wallet address
- Must start with `0x` and be 42 characters
- Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

**How to verify:**
- Address appears in the input field
- No error message

#### Field 3: Amount
**What to do:**
- Enter a number (e.g., `10.00`)
- Can be any amount you want

**How to verify:**
- Number appears in the input field

#### Field 4: Description (Optional)
**What to do:**
- Enter a note (e.g., "Send 10 USDC to Alice")
- This is optional but helpful

---

### Step 4: Check All Fields Are Filled

**Before clicking "Save Configuration", verify:**

- [ ] Chip is selected (dropdown shows your chip address)
- [ ] Token Address is filled (shows address starting with `0x`)
- [ ] Recipient Address is filled (shows address starting with `0x`)
- [ ] Amount is filled (shows a number)

**If ANY field is empty, you'll get "Please fill in all fields" error!**

---

### Step 5: Click "Save Configuration"

**What happens:**
1. Validation checks all fields
2. If valid, wallet popup appears
3. Confirm transaction in wallet
4. Configuration is saved on-chain

**If you get "Please fill in all fields":**
- Check each field one by one
- Make sure Token Address, Recipient, and Amount are ALL filled
- Make sure Chip is selected

---

## 🔍 Troubleshooting "Fill in All Fields" Error

### Issue 1: Chip Not Selected
**Symptom:** Dropdown is empty or shows placeholder

**Fix:**
- Make sure you registered a chip on `/register` page
- Refresh the page
- Check that your wallet is connected

### Issue 2: Token Address Not Filled
**Symptom:** Token address field is empty

**Fix:**
- Click "Use MockUSDC" button
- OR manually paste: `0xb090ae6dd89b25d1b79718853c439d1354bf62c5`
- Make sure it's a valid address (starts with `0x`, 42 characters)

### Issue 3: Recipient Address Not Filled
**Symptom:** Recipient field is empty or invalid

**Fix:**
- Enter a valid Ethereum address
- Must be exactly 42 characters
- Must start with `0x`
- Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

### Issue 4: Amount Not Filled
**Symptom:** Amount field is empty

**Fix:**
- Enter a number (e.g., `10.00`)
- Can be any positive number

---

## ✅ After Configuration is Saved

Once you see "Configuration saved successfully":

1. **Go to `/execute` page**
2. **Click "Execute Tap"**
3. **Tap your chip twice**
4. **Transaction executes!**

---

## 🎯 Complete Example

**What to enter:**

1. **Select Chip:** `0x742d...584d` (your chip)
2. **Action Type:** "ERC20 Transfer" (already selected)
3. **Token Address:** Click "Use MockUSDC" → `0xb090ae6dd89b25d1b79718853c439d1354bf62c5`
4. **Recipient:** `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb` (any valid address)
5. **Amount:** `10.00`
6. **Description:** `Send 10 USDC to Alice` (optional)

**Then click "Save Configuration" and confirm in wallet.**

---

## ⚠️ Common Mistakes

1. **Forgetting to select chip** - Most common mistake!
2. **Token address has spaces** - Make sure no extra spaces
3. **Recipient address is wrong format** - Must be valid Ethereum address
4. **Amount is empty** - Must enter a number

---

## 🔄 If Configuration Still Doesn't Save

1. **Check browser console** (F12) for errors
2. **Verify wallet is connected** - Check top right
3. **Check network** - Make sure you're on Base Sepolia (84532)
4. **Try refreshing the page**
5. **Clear browser cache** and try again

---

## 📱 Quick Checklist

Before clicking "Save Configuration":

- [ ] Wallet connected (see address in top right)
- [ ] Chip selected from dropdown
- [ ] Token Address filled (click "Use MockUSDC" or paste address)
- [ ] Recipient Address filled (valid Ethereum address)
- [ ] Amount filled (any number)
- [ ] Description filled (optional, but recommended)

**All checkboxes must be ✅ before saving!**





# 🔐 Hedera Account Setup - Critical for Deployment

## ⚠️ Why Transactions Failed

The error `"Requested resource not found. address '0x4f28D025d6B7d79Ea4d81723A39454feFe3757bE'"` means **the account doesn't exist on Hedera yet**.

### Key Difference: Hedera vs Ethereum

| Aspect | Ethereum | Hedera |
|--------|----------|--------|
| **Account Creation** | Auto-created when first used | Must be explicitly created |
| **Address Format** | `0x...` (auto-exists) | `0x...` (must exist first) |
| **Account ID** | Not used | `0.0.123456` (required) |

**On Hedera, you cannot use a random private key** - the account must be created first!

## ✅ Solution: Create Hedera Account First

### Method 1: Use Hedera Portal (Recommended)

1. **Go to [Hedera Portal](https://portal.hedera.com/)**
2. **Create a testnet account**:
   - Click "Create Account"
   - Choose "Testnet"
   - Save your credentials:
     - Account ID: `0.0.123456`
     - Private Key: `302e020100300506032b657004220420...` (Hedera format)
3. **Get testnet HBAR** from the faucet
4. **Convert to EVM address**:
   - Use HashPack wallet (shows both formats)
   - Or use Hedera SDK to convert Account ID to EVM address

### Method 2: Use HashPack Wallet

1. **Install [HashPack](https://www.hashpack.app/)**
2. **Create a new wallet** (or import existing)
3. **Get your EVM address**:
   - HashPack shows both Account ID and EVM address
   - Use the EVM address for deployment
4. **Export private key**:
   - HashPack allows you to export the private key
   - Use this for Foundry deployment

### Method 3: Use Hedera SDK to Create Account

```typescript
import { Client, AccountCreateTransaction, PrivateKey, Hbar } from "@hashgraph/sdk";

// Create a new account
const client = Client.forTestnet();
const newPrivateKey = PrivateKey.generateED25519();
const newPublicKey = newPrivateKey.publicKey;

const transaction = new AccountCreateTransaction()
    .setKey(newPublicKey)
    .setInitialBalance(Hbar.fromTinybars(100_000_000)); // 1 HBAR

const response = await transaction.execute(client);
const receipt = await response.getReceipt(client);
const accountId = receipt.accountId;

console.log("Account ID:", accountId.toString());
console.log("EVM Address:", accountId.toEvmAddress());
console.log("Private Key:", newPrivateKey.toString());
```

## 🔍 Check if Account Exists

You can check if your account exists on Hedera:

```bash
# Using curl to check account balance
curl -X POST https://testnet.hashio.io/api \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_getBalance",
    "params":["0x4f28D025d6B7d79Ea4d81723A39454feFe3757bE", "latest"],
    "id":1
  }'
```

If you get an error, the account doesn't exist.

## 🎯 Correct Deployment Process

### Step 1: Create Account on Hedera

1. Use Hedera Portal or HashPack to create an account
2. Get testnet HBAR (from faucet)
3. Note your Account ID and private key

### Step 2: Get EVM Address

Your Hedera account has:
- **Account ID**: `0.0.123456` (Hedera format)
- **EVM Address**: `0x...` (for contracts)

You need the **EVM address** for deployment.

### Step 3: Use Correct Private Key

- If using HashPack: Export the private key (it's in EVM format)
- If using Hedera Portal: You may need to convert the private key format

### Step 4: Deploy

```bash
cd packages/foundry
forge script script/Deploy.s.sol \
  --rpc-url hedera_testnet \
  --broadcast \
  --private-key 0x...your_evm_private_key...
```

## 🔄 What Happened in Your Deployment

Looking at your output:
- ✅ **2 contracts succeeded**: Registry and Protocol deployed
- ❌ **4 contracts failed**: Configuration, Executor, PaymentTerminal, MockUSDC failed

This suggests:
1. The account was created during the first transaction
2. But subsequent transactions failed (possibly due to nonce issues or account state)

## 💡 Quick Fix

1. **Check your account on HashScan**:
   - Visit https://hashscan.io/testnet
   - Search for your address: `0x4f28D025d6B7d79Ea4d81723A39454feFe3757bE`
   - See if it exists and has balance

2. **If account doesn't exist**:
   - Create account via Hedera Portal or HashPack
   - Fund it with HBAR
   - Use that account's private key

3. **If account exists but transactions failed**:
   - Check balance (need ~7.5 HBAR)
   - Try deploying again (some contracts already deployed)
   - Or deploy remaining contracts individually

## 📝 Next Steps

1. **Verify deployed contracts** on HashScan:
   - Registry: `0x026ef81A3b7A407e1Aa72A14581b28bd1B41377B` ✅
   - Protocol: `0xA1dA39776586dE176779Ce7888F76DE5399f5BcD` ✅

2. **Deploy remaining contracts**:
   - You can deploy them individually
   - Or fix the account issue and redeploy

3. **Update deployedContracts.ts** with the successful addresses

## 🆘 Still Having Issues?

The most common issue is using a private key from an account that doesn't exist on Hedera. Make sure you:
1. ✅ Created the account through Hedera Portal or HashPack
2. ✅ Funded it with testnet HBAR
3. ✅ Using the correct EVM-format private key
4. ✅ Account has sufficient balance (~10 HBAR recommended)



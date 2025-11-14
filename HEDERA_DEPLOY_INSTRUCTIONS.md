# 🚀 Hedera Deployment Instructions

## ✅ Deployment Script Fixed!

The deployment script now supports Hedera Testnet (296) and Hedera Mainnet (295).

## 📋 Pre-Deployment Checklist

1. ✅ **Get Hedera Testnet Account**
   - Go to [Hedera Portal](https://portal.hedera.com/)
   - Create a testnet account
   - Get testnet HBAR from the faucet
   - Save your account details

2. ✅ **Get Your Private Key**
   - Your Hedera account has both an Account ID (0.0.123456) and an EVM address (0x...)
   - You need the **private key** for the EVM address (0x... format)
   - This is the same format as Ethereum private keys

3. ✅ **Fund Your Account**
   - Make sure you have enough HBAR to pay for deployment
   - Estimated cost: ~7.5 HBAR (as shown in the output)

## 🔐 Deployment Methods

### Method 1: Using Private Key Flag (Recommended)

```bash
cd packages/foundry

# Deploy to Hedera Testnet
forge script script/Deploy.s.sol \
  --rpc-url hedera_testnet \
  --broadcast \
  --private-key YOUR_PRIVATE_KEY_HERE
```

**Example:**
```bash
forge script script/Deploy.s.sol \
  --rpc-url hedera_testnet \
  --broadcast \
  --private-key 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### Method 2: Using Environment Variable

```bash
# Set private key as environment variable
export PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Deploy
cd packages/foundry
forge script script/Deploy.s.sol --rpc-url hedera_testnet --broadcast
```

### Method 3: Using .env File

1. Create `.env` file in `packages/foundry/`:
```env
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

2. Load and deploy:
```bash
cd packages/foundry
source .env
forge script script/Deploy.s.sol --rpc-url hedera_testnet --broadcast
```

## 📝 What Gets Deployed

On Hedera Testnet, the following contracts will be deployed:

1. **TapThatXRegistry** - Chip registration
2. **TapThatXProtocol** - Core execution engine
3. **TapThatXConfiguration** - Action storage
4. **TapThatXExecutor** - Simplified interface
5. **TapThatXPaymentTerminal** - Payment terminal
6. **MockUSDC** - Test token for ERC20 transfers

## 🔍 After Deployment

1. **Save Contract Addresses**
   - The deployment will output all contract addresses
   - Update `packages/nextjs/contracts/deployedContracts.ts` with these addresses

2. **Verify on HashScan**
   - Visit [HashScan Testnet](https://hashscan.io/testnet)
   - Search for your contract addresses
   - Verify the deployments

3. **Update Frontend**
   - Add Hedera testnet (296) to `deployedContracts.ts`
   - Include all deployed contract addresses and ABIs

## ⚠️ Important Notes

### Private Key Format
- Must start with `0x`
- Must be 64 hex characters (32 bytes)
- Example: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

### Security
- **Never commit private keys to git**
- Use environment variables or `.env` files (add to `.gitignore`)
- Use testnet keys only for testing

### Gas/Fees
- Hedera uses fees (not gas)
- Fees are paid in HBAR
- Estimated deployment cost: ~7.5 HBAR
- Make sure your account has sufficient balance

## 🎯 Quick Deploy Command

```bash
cd packages/foundry && \
forge script script/Deploy.s.sol \
  --rpc-url hedera_testnet \
  --broadcast \
  --private-key $PRIVATE_KEY
```

## ✅ Success Output

When successful, you'll see:
```
=== Tap That X Protocol Deployed ===
Chain ID: 296
Network: Hedera Testnet
TapThatXRegistry: 0x...
TapThatXProtocol: 0x...
...
Hedera Deployment Complete!
View on HashScan: https://hashscan.io/testnet
```

Then update your `deployedContracts.ts` file with the addresses!



# 🚀 Hedera EVM-Compatible Deployment Guide

This guide shows how to deploy and use TapThatX on Hedera using EVM compatibility (no SDK changes needed!).

## ✅ What's Already Done

The migration to Hedera EVM compatibility is **complete**! Here's what was changed:

1. ✅ **Hedera Chain Definitions** - Added `hederaTestnet` and `hederaMainnet` to Viem
2. ✅ **Network Configuration** - Updated `scaffold.config.ts` with Hedera networks
3. ✅ **Foundry Configuration** - Added Hedera RPC endpoints
4. ✅ **Relay API** - Updated to handle Hedera networks
5. ✅ **Utilities** - Created Hedera helper functions

## 🎯 Key Points

- **No SDK changes needed** - We're using Viem with Hedera RPC endpoints
- **Contracts work as-is** - Solidity contracts are EVM-compatible
- **Same wallet format** - Use standard EVM addresses (0x...)
- **Same transaction format** - Standard EVM transactions

## 📋 Deployment Steps

### 1. Get Hedera Testnet Account

1. Go to [Hedera Portal](https://portal.hedera.com/)
2. Create a testnet account
3. Get testnet HBAR from the faucet
4. Save your account details:
   - Account ID: `0.0.123456`
   - Private Key: `302e020100300506032b657004220420...`

### 2. Convert Account to EVM Address

Hedera accounts have both an Account ID (`0.0.123456`) and an EVM address (`0x...`).

**Option A: Use HashPack Wallet**
- Install [HashPack](https://www.hashpack.app/)
- Your wallet will show both Account ID and EVM address
- Use the EVM address for contracts

**Option B: Use Hedera SDK (for conversion)**
```bash
cd packages/nextjs
yarn add @hashgraph/sdk
```

```typescript
import { AccountId, PrivateKey } from "@hashgraph/sdk";

const accountId = AccountId.fromString("0.0.123456");
const evmAddress = accountId.toEvmAddress(); // Returns 0x...
```

### 3. Fund Your Relayer Account

Your relayer needs HBAR to pay for transactions:

1. Get testnet HBAR from [Hedera Portal](https://portal.hedera.com/)
2. Send HBAR to your relayer's EVM address
3. Verify balance on [HashScan Testnet](https://hashscan.io/testnet)

### 4. Update Environment Variables

**File**: `packages/nextjs/.env.local`

```env
# Hedera Relayer Configuration
# Use EVM address format (0x...) for contracts
RELAYER_PRIVATE_KEY=0x...your_private_key_here...

# Optional: Hedera-specific config
HEDERA_NETWORK=testnet
```

**Important**: 
- Use the **EVM address** format (0x...) for `RELAYER_PRIVATE_KEY`
- This is the same format as Ethereum - no changes needed!

### 5. Deploy Contracts to Hedera Testnet

```bash
cd packages/foundry

# Deploy to Hedera testnet
forge script script/Deploy.s.sol:Deploy \
  --rpc-url hedera_testnet \
  --broadcast \
  --verify \
  --etherscan-api-key ${HASHSCAN_API_KEY} \
  --verifier-url https://hashscan.io/testnet/api
```

**Note**: You'll need to update the deployment script to use your relayer account.

### 6. Update Contract Addresses

After deployment, update `packages/nextjs/contracts/deployedContracts.ts`:

```typescript
export const deployedContracts = {
  296: { // Hedera Testnet chain ID
    TapThatXRegistry: {
      address: "0x...", // Your deployed contract address
      abi: [...],
    },
    TapThatXProtocol: {
      address: "0x...",
      abi: [...],
    },
    // ... other contracts
  },
  // ... other networks
} as const;
```

### 7. Test the Application

1. **Start the dev server**:
   ```bash
   cd packages/nextjs
   yarn start
   ```

2. **Connect Wallet**:
   - Use MetaMask or any EVM-compatible wallet
   - Add Hedera Testnet network:
     - Chain ID: `296`
     - RPC URL: `https://testnet.hashio.io/api`
     - Currency: `HBAR`
     - Explorer: `https://hashscan.io/testnet`

3. **Test Registration**:
   - Go to `/register`
   - Connect wallet
   - Register your NFC chip

4. **Test Execution**:
   - Configure an action
   - Execute via NFC tap
   - Verify on HashScan

## 🔍 Verifying on HashScan

All transactions can be viewed on [HashScan Testnet](https://hashscan.io/testnet):

- Search by transaction hash
- Search by contract address
- Search by account address (EVM format)

## 🌐 Network Details

### Hedera Testnet
- **Chain ID**: `296`
- **RPC URL**: `https://testnet.hashio.io/api`
- **Explorer**: `https://hashscan.io/testnet`
- **Native Token**: HBAR (testnet)
- **Block Time**: ~3-5 seconds

### Hedera Mainnet
- **Chain ID**: `295`
- **RPC URL**: `https://mainnet.hashio.io/api`
- **Explorer**: `https://hashscan.io`
- **Native Token**: HBAR
- **Block Time**: ~3-5 seconds

## 🔧 Troubleshooting

### Issue: "Unsupported chain"
**Solution**: Make sure you're using chain ID `296` (testnet) or `295` (mainnet)

### Issue: "Insufficient balance"
**Solution**: Fund your relayer account with HBAR from the faucet

### Issue: "Contract not found"
**Solution**: Verify contract addresses in `deployedContracts.ts` match your deployment

### Issue: "RPC error"
**Solution**: Check that Hedera RPC endpoints are accessible:
- Testnet: `https://testnet.hashio.io/api`
- Mainnet: `https://mainnet.hashio.io/api`

## 📝 Key Differences from Ethereum

| Aspect | Ethereum | Hedera (EVM) |
|--------|----------|--------------|
| **Chain ID** | 1 (mainnet) | 295 (mainnet), 296 (testnet) |
| **RPC URL** | Various | `https://testnet.hashio.io/api` |
| **Explorer** | Etherscan | HashScan |
| **Native Token** | ETH | HBAR |
| **Block Time** | ~12s | ~3-5s |
| **Address Format** | `0x...` | `0x...` (same!) |

## ✅ What Works Without Changes

- ✅ All Solidity contracts
- ✅ All Viem/Wagmi hooks
- ✅ All transaction formats
- ✅ All contract ABIs
- ✅ All wallet connections (MetaMask, etc.)
- ✅ NFC chip integration
- ✅ EIP-712 signing

## 🎉 You're Ready!

Your application is now configured for Hedera! Just:

1. Deploy contracts to Hedera testnet
2. Update contract addresses
3. Fund relayer account
4. Start testing!

The beauty of EVM compatibility is that **everything else stays the same**! 🚀



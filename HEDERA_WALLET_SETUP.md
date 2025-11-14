# 🔐 Hedera Wallet Setup Guide

Since Hedera Smart Contract Service is **EVM-compatible**, you can use both MetaMask and HashPack wallets!

## ✅ Supported Wallets

### 1. MetaMask (EVM-Compatible)
- ✅ Works with Hedera EVM contracts
- ✅ Uses standard EVM addresses (0x...)
- ✅ Standard Web3 interface
- ⚠️ Requires manual network configuration

### 2. HashPack (Native Hedera Wallet)
- ✅ Works with Hedera EVM contracts
- ✅ Also supports native Hedera features
- ✅ Better Hedera integration
- ✅ Shows both Account ID and EVM address
- ✅ Built-in Hedera network support

## 🔧 MetaMask Setup

### Add Hedera Testnet to MetaMask

1. **Open MetaMask** and click the network dropdown
2. **Click "Add Network"** → "Add a network manually"
3. **Enter these details**:

**Hedera Testnet:**
```
Network Name: Hedera Testnet
RPC URL: https://testnet.hashio.io/api
Chain ID: 296
Currency Symbol: HBAR
Block Explorer: https://hashscan.io/testnet
```

**Hedera Mainnet:**
```
Network Name: Hedera Mainnet
RPC URL: https://mainnet.hashio.io/api
Chain ID: 295
Currency Symbol: HBAR
Block Explorer: https://hashscan.io
```

4. **Save** and switch to Hedera Testnet

### Get Testnet HBAR for MetaMask

1. Go to [Hedera Portal](https://portal.hedera.com/)
2. Create a testnet account
3. Get testnet HBAR from the faucet
4. **Important**: You need to send HBAR to your MetaMask address (0x... format)

**Note**: MetaMask will show your EVM address (0x...), which is compatible with Hedera EVM contracts.

## 🔧 HashPack Setup

### Install HashPack

1. **Browser Extension**: Install from [HashPack website](https://www.hashpack.app/)
2. **Mobile App**: Available on iOS and Android

### Connect HashPack

1. **Create/Import Wallet** in HashPack
2. **Get Testnet HBAR** from [Hedera Portal](https://portal.hedera.com/)
3. **Connect to Your DApp**:
   - HashPack provides both Account ID (0.0.123456) and EVM address (0x...)
   - Your DApp will use the EVM address for contract interactions

### HashPack Features

- ✅ Shows both Account ID and EVM address
- ✅ Native Hedera token support (HTS)
- ✅ Better transaction history
- ✅ Built-in Hedera network support
- ✅ Can interact with both EVM contracts and native Hedera features

## 💻 Code Integration

### Using MetaMask (Standard Web3)

Your existing Wagmi/RainbowKit setup works with MetaMask:

```typescript
// Already works! Just connect MetaMask to Hedera network
const { address } = useAccount(); // Gets EVM address (0x...)
```

### Using HashPack

HashPack also works with standard Web3, but you can also use HashConnect:

```typescript
// Option 1: Use HashConnect SDK (optional)
import { HashConnect } from "hashconnect";

// Option 2: Use standard Web3 (works with Wagmi)
// HashPack exposes standard Web3 interface
const { address } = useAccount(); // Gets EVM address
```

## 🎯 Which Wallet to Use?

### Use MetaMask if:
- ✅ You're already familiar with MetaMask
- ✅ You want standard Web3 experience
- ✅ You're only using EVM contracts
- ✅ Your users already have MetaMask

### Use HashPack if:
- ✅ You want native Hedera features
- ✅ You need HTS (Hedera Token Service) support
- ✅ You want better Hedera integration
- ✅ You want to show Account IDs alongside addresses

## 🔄 Wallet Switching

Users can switch between wallets:

1. **MetaMask**: Standard Web3 connection
2. **HashPack**: Also supports Web3, or use HashConnect
3. **Both**: Can be used simultaneously (different accounts)

## 📝 Important Notes

### Address Format

- **MetaMask**: Shows only EVM address (0x...)
- **HashPack**: Shows both Account ID (0.0.123456) and EVM address (0x...)
- **Contracts**: Use EVM address (0x...) for both wallets

### Network Configuration

- **MetaMask**: Requires manual network addition
- **HashPack**: Has Hedera networks built-in
- **Both**: Use same RPC endpoints and chain IDs

### Transaction Format

- **Both wallets**: Use standard EVM transaction format
- **Gas/Fees**: Paid in HBAR (not ETH)
- **Block Time**: ~3-5 seconds (faster than Ethereum)

## 🚀 Quick Start

### For Users with MetaMask:

1. Add Hedera Testnet network (see above)
2. Get testnet HBAR from [Hedera Portal](https://portal.hedera.com/)
3. Send HBAR to MetaMask address
4. Connect to your DApp

### For Users with HashPack:

1. Install HashPack extension
2. Create/import wallet
3. Get testnet HBAR from [Hedera Portal](https://portal.hedera.com/)
4. Connect to your DApp (HashPack auto-detects Hedera networks)

## ✅ Summary

**Yes, both wallets work!**

- ✅ **MetaMask**: Works via EVM compatibility (requires network config)
- ✅ **HashPack**: Works via EVM compatibility + native Hedera features
- ✅ **Your DApp**: Works with both (uses standard Web3 interface)
- ✅ **Address Format**: Both use EVM addresses (0x...) for contracts

The beauty of EVM compatibility is that **your existing wallet integration code works with both!** 🎉



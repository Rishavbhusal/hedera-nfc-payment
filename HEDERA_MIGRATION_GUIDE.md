# 🚀 Hedera Migration Guide

Complete guide to migrate TapThatX from Ethereum to Hedera Hashgraph.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Key Differences](#key-differences)
3. [Migration Steps](#migration-steps)
4. [Smart Contracts](#smart-contracts)
5. [Frontend Migration](#frontend-migration)
6. [Backend Migration](#backend-migration)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## 🎯 Overview

Hedera Hashgraph is a public distributed ledger that uses a different consensus mechanism than Ethereum. However, **Hedera Smart Contract Service (HSCS) is EVM-compatible**, which means your Solidity contracts can work with minimal changes.

### What Changes
- ✅ **Smart Contracts**: Minimal changes (mostly network configuration)
- 🔄 **Frontend**: Replace Wagmi/Viem with Hedera SDK
- 🔄 **Backend**: Replace Viem with Hedera SDK
- 🔄 **Wallet Integration**: Replace RainbowKit with Hedera wallets
- 🔄 **Network Config**: Update to Hedera networks (testnet/mainnet)

### What Stays the Same
- ✅ **NFC Integration**: `@arx-research/libhalo` works the same
- ✅ **Web NFC API**: No changes needed
- ✅ **Contract Logic**: Solidity code remains largely the same
- ✅ **EIP-712 Signing**: Still works (Hedera supports ECDSA for EVM contracts)

---

## 🔑 Key Differences

| Aspect | Ethereum | Hedera |
|--------|----------|--------|
| **Account Format** | `0x...` addresses | Account IDs (`0.0.123456`) |
| **Native Token** | ETH | HBAR |
| **Gas Model** | Gas (gwei) | Fees (HBAR) |
| **Block Time** | ~12s (varies) | ~3-5s (consistent) |
| **Consensus** | Proof of Stake | Hashgraph (aBFT) |
| **Smart Contracts** | EVM | EVM-compatible (HSCS) |
| **Signature** | ECDSA (secp256k1) | Ed25519 (native), ECDSA (EVM) |
| **RPC Endpoints** | JSON-RPC | JSON-RPC (compatible) |
| **Transaction Format** | Ethereum tx | Hedera tx (different structure) |

### Important Notes

1. **EVM Compatibility**: Hedera Smart Contract Service is EVM-compatible, so your Solidity contracts will work, but you need to use Hedera SDK for transactions.

2. **Account IDs vs Addresses**: 
   - Hedera uses account IDs like `0.0.123456`
   - EVM contracts still use `0x...` addresses
   - You can convert between them using Hedera SDK

3. **Signatures**: 
   - Native Hedera uses Ed25519
   - EVM contracts on Hedera use ECDSA (same as Ethereum)
   - Your NFC chip (ECDSA) will work fine

4. **Fees**: 
   - Hedera uses a fee model (not gas)
   - Fees are predictable and low
   - Relayer pays fees in HBAR

---

## 📝 Migration Steps

### Phase 1: Install Hedera Dependencies

```bash
cd packages/nextjs
yarn add @hashgraph/sdk
yarn add @hashgraph/hedera-wallet-connect
yarn remove wagmi viem @rainbow-me/rainbowkit
```

### Phase 2: Update Smart Contract Deployment

### Phase 3: Replace Frontend Libraries

### Phase 4: Update Backend Relay

### Phase 5: Update Network Configuration

### Phase 6: Test and Deploy

---

## 📜 Smart Contracts

### Minimal Changes Required

Since Hedera Smart Contract Service is EVM-compatible, your Solidity contracts need **minimal changes**:

#### 1. Update Network Configuration

**File**: `packages/foundry/foundry.toml`

```toml
[rpc_endpoints]
hedera_testnet = "https://testnet.hashio.io/api"
hedera_mainnet = "https://mainnet.hashio.io/api"

[etherscan]
hedera_testnet = { key = "YOUR_API_KEY", url = "https://hashscan.io/testnet/api" }
hedera_mainnet = { key = "YOUR_API_KEY", url = "https://hashscan.io/api" }
```

#### 2. Update Deployment Scripts

**File**: `packages/foundry/script/Deploy.s.sol`

```solidity
// Add Hedera network support
// Hedera testnet chain ID: 296
// Hedera mainnet chain ID: 295
```

#### 3. Contract Addresses

Hedera uses different address formats:
- **Account IDs**: `0.0.123456` (Hedera native)
- **EVM Addresses**: `0x...` (for smart contracts)

Your contracts will use EVM addresses (`0x...`), which work the same way.

### No Code Changes Needed

Your contracts should work as-is because:
- ✅ Solidity syntax is the same
- ✅ EVM opcodes are the same
- ✅ EIP-712 works the same
- ✅ ECDSA signatures work the same

---

## 🎨 Frontend Migration

### Step 1: Install Hedera SDK

```bash
cd packages/nextjs
yarn add @hashgraph/sdk
yarn add @hashgraph/hedera-wallet-connect
```

### Step 2: Create Hedera Configuration

**New File**: `packages/nextjs/config/hedera.config.ts`

```typescript
import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";

export const HEDERA_NETWORKS = {
  testnet: {
    name: "Hedera Testnet",
    chainId: 296,
    rpcUrl: "https://testnet.hashio.io/api",
    explorerUrl: "https://hashscan.io/testnet",
  },
  mainnet: {
    name: "Hedera Mainnet",
    chainId: 295,
    rpcUrl: "https://mainnet.hashio.io/api",
    explorerUrl: "https://hashscan.io",
  },
} as const;

export type HederaNetwork = keyof typeof HEDERA_NETWORKS;

// Create Hedera client
export function createHederaClient(network: HederaNetwork = "testnet") {
  const networkConfig = HEDERA_NETWORKS[network];
  
  if (network === "testnet") {
    return Client.forTestnet();
  } else {
    return Client.forMainnet();
  }
}

// Convert EVM address to Hedera account ID (if needed)
export function evmAddressToAccountId(address: string): AccountId {
  // Hedera SDK can handle EVM addresses directly
  // But if you need account ID format:
  // This is a simplified example - actual conversion may vary
  return AccountId.fromString(address);
}
```

### Step 3: Replace Wagmi with Hedera Hooks

**New File**: `packages/nextjs/hooks/useHederaAccount.ts`

```typescript
"use client";

import { useState, useEffect } from "react";
import { AccountId } from "@hashgraph/sdk";

export function useHederaAccount() {
  const [accountId, setAccountId] = useState<AccountId | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if wallet is connected
    const checkConnection = async () => {
      try {
        // Check for HashConnect or other Hedera wallet
        const wallet = (window as any).hedera?.wallet;
        if (wallet) {
          const account = await wallet.getAccount();
          setAccountId(account);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Error checking Hedera wallet:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  const connect = async () => {
    try {
      const wallet = (window as any).hedera?.wallet;
      if (!wallet) {
        throw new Error("Hedera wallet not found");
      }
      
      const account = await wallet.connect();
      setAccountId(account);
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting Hedera wallet:", error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      const wallet = (window as any).hedera?.wallet;
      if (wallet) {
        await wallet.disconnect();
      }
      setAccountId(null);
      setIsConnected(false);
    } catch (error) {
      console.error("Error disconnecting Hedera wallet:", error);
    }
  };

  return {
    accountId,
    address: accountId?.toEvmAddress() || null, // Convert to EVM address for contracts
    isConnected,
    isLoading,
    connect,
    disconnect,
  };
}
```

### Step 4: Replace Contract Read Hooks

**New File**: `packages/nextjs/hooks/useHederaReadContract.ts`

```typescript
"use client";

import { useState, useEffect } from "react";
import { ContractFunctionParameters, ContractExecuteTransaction } from "@hashgraph/sdk";
import { createHederaClient } from "~~/config/hedera.config";

export function useHederaReadContract<T = any>({
  contractAddress,
  functionName,
  args = [],
  abi,
  enabled = true,
}: {
  contractAddress: string;
  functionName: string;
  args?: any[];
  abi: any[];
  enabled?: boolean;
}) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !contractAddress) {
      setIsLoading(false);
      return;
    }

    const readContract = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const client = createHederaClient("testnet"); // or get from context
        
        // Create contract call transaction
        const transaction = new ContractExecuteTransaction()
          .setContractId(contractAddress) // Hedera uses ContractId
          .setFunction(functionName, new ContractFunctionParameters().addStringArray(args));

        // Execute query (read-only, no fee)
        const response = await transaction.execute(client);
        const result = await response.getRecord(client);
        
        setData(result.contractFunctionResult?.getString(0) as T);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Contract read failed"));
      } finally {
        setIsLoading(false);
      }
    };

    readContract();
  }, [contractAddress, functionName, JSON.stringify(args), enabled, abi]);

  return { data, isLoading, error };
}
```

### Step 5: Replace Contract Write Hooks

**New File**: `packages/nextjs/hooks/useHederaWriteContract.ts`

```typescript
"use client";

import { useState } from "react";
import { ContractExecuteTransaction, ContractFunctionParameters } from "@hashgraph/sdk";
import { createHederaClient } from "~~/config/hedera.config";
import { useHederaAccount } from "./useHederaAccount";

export function useHederaWriteContract() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { accountId, isConnected } = useHederaAccount();

  const writeContract = async ({
    contractAddress,
    functionName,
    args = [],
    value = 0,
    gas = 1000000,
  }: {
    contractAddress: string;
    functionName: string;
    args?: any[];
    value?: number;
    gas?: number;
  }) => {
    if (!isConnected || !accountId) {
      throw new Error("Wallet not connected");
    }

    setIsPending(true);
    setError(null);

    try {
      const client = createHederaClient("testnet");
      
      // Create contract execution transaction
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractAddress)
        .setFunction(functionName, new ContractFunctionParameters().addStringArray(args))
        .setGas(gas);

      if (value > 0) {
        transaction.setPayableAmount(value);
      }

      // Sign and execute
      const wallet = (window as any).hedera?.wallet;
      const signedTx = await wallet.signTransaction(transaction);
      const response = await signedTx.execute(client);
      const receipt = await response.getReceipt(client);

      return {
        hash: receipt.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Contract write failed");
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { writeContract, isPending, error };
}
```

### Step 6: Update Pages

**File**: `packages/nextjs/app/register/page.tsx`

Replace:
```typescript
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
```

With:
```typescript
import { useHederaAccount } from "~~/hooks/useHederaAccount";
import { useHederaWriteContract } from "~~/hooks/useHederaWriteContract";
```

And update the hooks:
```typescript
// Before
const { address } = useAccount();
const { writeContract } = useWriteContract();

// After
const { address, isConnected, connect } = useHederaAccount();
const { writeContract } = useHederaWriteContract();
```

### Step 7: Update Scaffold Config

**File**: `packages/nextjs/scaffold.config.ts`

```typescript
// Remove Ethereum chains, add Hedera networks
export const scaffoldConfig = {
  targetNetworks: [
    {
      id: 296,
      name: "Hedera Testnet",
      nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 8 },
      rpcUrls: {
        default: { http: ["https://testnet.hashio.io/api"] },
      },
      blockExplorers: {
        default: { name: "HashScan", url: "https://hashscan.io/testnet" },
      },
    },
  ],
  // ... rest of config
} as const;
```

---

## ⚙️ Backend Migration

### Step 1: Update Relay API

**File**: `packages/nextjs/app/api/relay-execute-tap/route.ts`

Replace Viem with Hedera SDK:

```typescript
import { NextRequest, NextResponse } from "next/server";
import {
  Client,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  PrivateKey,
  AccountId,
  Hbar,
} from "@hashgraph/sdk";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner, chip, chipSignature, timestamp, nonce, value } = body;

    // Validate inputs
    if (!owner || !chip || !chipSignature || !timestamp || !nonce) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Get relayer account from environment
    const RELAYER_ACCOUNT_ID = process.env.RELAYER_ACCOUNT_ID; // e.g., "0.0.123456"
    const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY; // Hedera private key

    if (!RELAYER_ACCOUNT_ID || !RELAYER_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Relayer credentials not configured" },
        { status: 500 },
      );
    }

    // Create Hedera client
    const client = Client.forTestnet(); // or Client.forMainnet()
    client.setOperator(
      AccountId.fromString(RELAYER_ACCOUNT_ID),
      PrivateKey.fromString(RELAYER_PRIVATE_KEY),
    );

    // Get contract address (from deployedContracts)
    const executorAddress = process.env.TAPTHATX_EXECUTOR_CONTRACT_ID; // Hedera contract ID

    // Create contract execution transaction
    const transaction = new ContractExecuteTransaction()
      .setContractId(executorAddress)
      .setFunction(
        "executeTap",
        new ContractFunctionParameters()
          .addAddress(owner) // Convert to Hedera address format if needed
          .addAddress(chip)
          .addBytes(Buffer.from(chipSignature.slice(2), "hex"))
          .addUint256(BigInt(timestamp))
          .addBytes32(Buffer.from(nonce.slice(2), "hex")),
      )
      .setGas(2_000_000); // Set appropriate gas limit

    if (value && BigInt(value) > 0n) {
      transaction.setPayableAmount(Hbar.fromTinybars(BigInt(value)));
    }

    // Execute transaction
    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);

    return NextResponse.json({
      success: true,
      transactionHash: receipt.transactionId.toString(),
      blockNumber: receipt.blockNumber?.toString() || "0",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Execution relay failed" },
      { status: 500 },
    );
  }
}
```

### Step 2: Update Environment Variables

**File**: `.env.local`

```env
# Hedera Configuration
RELAYER_ACCOUNT_ID=0.0.123456
RELAYER_PRIVATE_KEY=302e020100300506032b657004220420...
TAPTHATX_EXECUTOR_CONTRACT_ID=0.0.789012
HEDERA_NETWORK=testnet

# Remove Ethereum-specific vars
# RELAYER_PRIVATE_KEY=0x... (old format)
```

---

## 🧪 Testing

### Step 1: Set Up Hedera Testnet Account

1. Go to [Hedera Portal](https://portal.hedera.com/)
2. Create a testnet account
3. Get testnet HBAR from [Hedera Testnet Faucet](https://portal.hedera.com/)
4. Save your account ID and private key

### Step 2: Deploy Contracts to Hedera Testnet

```bash
cd packages/foundry

# Update foundry.toml with Hedera RPC
# Deploy contracts
forge script script/Deploy.s.sol:HederaDeploy --rpc-url hedera_testnet --broadcast
```

### Step 3: Test Registration Flow

1. Connect Hedera wallet
2. Register NFC chip
3. Verify on HashScan explorer

### Step 4: Test Execution Flow

1. Configure an action
2. Execute via NFC tap
3. Verify transaction on HashScan

---

## 🚀 Deployment

### Testnet Deployment

1. **Deploy Contracts**:
   ```bash
   forge script script/Deploy.s.sol:HederaDeploy \
     --rpc-url https://testnet.hashio.io/api \
     --broadcast \
     --verify
   ```

2. **Update Contract Addresses**:
   Update `packages/nextjs/contracts/deployedContracts.ts` with Hedera contract IDs

3. **Configure Relayer**:
   - Fund relayer account with HBAR
   - Set environment variables
   - Test relay endpoint

### Mainnet Deployment

1. **Switch to Mainnet**:
   ```typescript
   const client = Client.forMainnet();
   ```

2. **Update RPC URLs**:
   ```typescript
   rpcUrl: "https://mainnet.hashio.io/api"
   ```

3. **Deploy Contracts**:
   Same process as testnet, but use mainnet RPC

---

## 📚 Additional Resources

- [Hedera Documentation](https://docs.hedera.com/)
- [Hedera SDK for JavaScript](https://github.com/hashgraph/hedera-sdk-js)
- [Hedera Smart Contract Service](https://docs.hedera.com/hedera/smart-contracts/)
- [HashConnect Wallet](https://www.hashpack.app/)
- [HashScan Explorer](https://hashscan.io/)

---

## ⚠️ Important Considerations

### 1. Account ID Format

Hedera uses account IDs (`0.0.123456`), but EVM contracts use addresses (`0x...`). The SDK handles conversion automatically, but be aware of the difference.

### 2. Fee Structure

Hedera uses a fee model instead of gas:
- Fees are predictable
- Fees are paid in HBAR
- Fees are typically lower than Ethereum gas

### 3. Transaction Finality

Hedera has faster finality (~3-5 seconds) compared to Ethereum, which improves UX.

### 4. Signature Format

- Native Hedera: Ed25519
- EVM Contracts: ECDSA (same as Ethereum)
- Your NFC chip uses ECDSA, so it works fine with EVM contracts on Hedera

### 5. Network Differences

- **Testnet**: Free HBAR from faucet
- **Mainnet**: Real HBAR required
- **RPC Endpoints**: Different URLs for testnet/mainnet

---

## 🎯 Migration Checklist

- [ ] Install Hedera SDK dependencies
- [ ] Create Hedera configuration file
- [ ] Replace Wagmi hooks with Hedera hooks
- [ ] Update contract read/write functions
- [ ] Update relay API to use Hedera SDK
- [ ] Update environment variables
- [ ] Deploy contracts to Hedera testnet
- [ ] Test registration flow
- [ ] Test execution flow
- [ ] Update documentation
- [ ] Deploy to Hedera mainnet (when ready)

---

## 💡 Tips

1. **Start with Testnet**: Always test on Hedera testnet first
2. **Use HashScan**: Monitor transactions on HashScan explorer
3. **Account Management**: Keep relayer account well-funded with HBAR
4. **Error Handling**: Hedera errors are different from Ethereum - handle accordingly
5. **Gas Limits**: Hedera uses different gas limits - test and adjust

---

Good luck with your migration! 🚀



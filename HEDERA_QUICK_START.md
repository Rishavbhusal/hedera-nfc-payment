# ⚡ Hedera Migration Quick Start

Quick reference for the most critical changes needed to migrate to Hedera.

## 🚀 Quick Installation

```bash
cd packages/nextjs
yarn add @hashgraph/sdk
yarn remove wagmi viem @rainbow-me/rainbowkit
```

## 📝 Key File Replacements

### 1. Replace `scaffold.config.ts`

```typescript
// packages/nextjs/scaffold.config.ts
export const scaffoldConfig = {
  targetNetworks: [
    {
      id: 296,
      name: "Hedera Testnet",
      nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 8 },
      rpcUrls: {
        default: { http: ["https://testnet.hashio.io/api"] },
      },
    },
  ],
  // Remove alchemyApiKey, walletConnectProjectId (not needed for Hedera)
} as const;
```

### 2. Create Hedera Client Utility

```typescript
// packages/nextjs/utils/hedera.ts
import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";

export function getHederaClient(network: "testnet" | "mainnet" = "testnet") {
  return network === "testnet" ? Client.forTestnet() : Client.forMainnet();
}

export function setupRelayerClient() {
  const accountId = process.env.RELAYER_ACCOUNT_ID!;
  const privateKey = process.env.RELAYER_PRIVATE_KEY!;
  
  const client = getHederaClient(process.env.HEDERA_NETWORK as any || "testnet");
  client.setOperator(
    AccountId.fromString(accountId),
    PrivateKey.fromString(privateKey),
  );
  
  return client;
}
```

### 3. Update Relay API (Critical)

```typescript
// packages/nextjs/app/api/relay-execute-tap/route.ts
import { ContractExecuteTransaction, ContractFunctionParameters } from "@hashgraph/sdk";
import { setupRelayerClient } from "~~/utils/hedera";

export async function POST(req: NextRequest) {
  const { owner, chip, chipSignature, timestamp, nonce } = await req.json();
  
  const client = setupRelayerClient();
  const executorContractId = process.env.TAPTHATX_EXECUTOR_CONTRACT_ID!;
  
  const transaction = new ContractExecuteTransaction()
    .setContractId(executorContractId)
    .setFunction(
      "executeTap",
      new ContractFunctionParameters()
        .addAddress(owner)
        .addAddress(chip)
        .addBytes(Buffer.from(chipSignature.slice(2), "hex"))
        .addUint256(BigInt(timestamp))
        .addBytes32(Buffer.from(nonce.slice(2), "hex")),
    )
    .setGas(2_000_000);
  
  const response = await transaction.execute(client);
  const receipt = await response.getReceipt(client);
  
  return NextResponse.json({
    success: true,
    transactionHash: receipt.transactionId.toString(),
  });
}
```

### 4. Replace Wallet Connection

```typescript
// packages/nextjs/components/WalletConnect.tsx
"use client";

import { useState } from "react";

export function HederaWalletConnect() {
  const [accountId, setAccountId] = useState<string | null>(null);
  
  const connect = async () => {
    // Use HashConnect or other Hedera wallet
    const wallet = (window as any).hedera?.wallet;
    if (!wallet) {
      alert("Please install HashPack wallet");
      return;
    }
    
    const account = await wallet.connect();
    setAccountId(account.toString());
  };
  
  return (
    <button onClick={connect}>
      {accountId ? `Connected: ${accountId}` : "Connect Hedera Wallet"}
    </button>
  );
}
```

## 🔧 Environment Variables

```env
# .env.local
RELAYER_ACCOUNT_ID=0.0.123456
RELAYER_PRIVATE_KEY=302e020100300506032b657004220420...
TAPTHATX_EXECUTOR_CONTRACT_ID=0.0.789012
HEDERA_NETWORK=testnet
```

## 📦 Contract Deployment

```bash
# Update foundry.toml
[rpc_endpoints]
hedera_testnet = "https://testnet.hashio.io/api"

# Deploy
forge script script/Deploy.s.sol \
  --rpc-url hedera_testnet \
  --broadcast
```

## ✅ Testing Checklist

1. ✅ Install dependencies
2. ✅ Update environment variables
3. ✅ Deploy contracts to Hedera testnet
4. ✅ Test wallet connection
5. ✅ Test registration flow
6. ✅ Test execution flow

## 🆘 Common Issues

### Issue: "Account ID format invalid"
**Solution**: Use format `0.0.123456` not `0x...`

### Issue: "Insufficient balance"
**Solution**: Fund account with HBAR from [Hedera Portal](https://portal.hedera.com/)

### Issue: "Contract not found"
**Solution**: Use Hedera contract ID format `0.0.789012` not EVM address

---

For detailed migration guide, see `HEDERA_MIGRATION_GUIDE.md`



# TapThatX Project Summary for Hedera Implementation

## 🎯 Project Overview

**TapThatX** is a gasless, NFC chip-based blockchain interaction protocol that enables users to execute any blockchain transaction by simply tapping their phone on an NFC chip. The core innovation is replacing the entire Web3 UX flow (wallet popups, gas approvals, confirmations) with a single physical tap.

### Key Value Propositions

- **Zero Gas Fees for Users**: Backend relayer pays all transaction costs
- **Sub-3-Second Execution**: Tap → Execute in under 3 seconds
- **Universal Actions**: Not just payments - any contract interaction (transfers, DeFi, NFTs, etc.)
- **Hardware Security**: NFC chip private keys never leave the secure element
- **Chain-Agnostic Chips**: Register once, use on any EVM-compatible chain

---

## 🏗️ System Architecture

### High-Level Flow

```
NFC Chip (HaLo) 
    ↓ (Web NFC API - 2-3 sec)
Mobile Device (Browser)
    ↓ (HTTPS POST)
Gasless Relay (Next.js API)
    ↓ (writeContract)
Smart Contracts (EVM)
    ↓ (execute)
Target Contract (ERC20, DeFi, etc.)
```

### Core Components

1. **NFC Hardware**: Arx HaLo chips with EIP-712 signing capability
2. **Frontend**: Next.js app with Web NFC integration
3. **Backend Relay**: Gasless transaction executor (pays gas for users)
4. **Smart Contracts**: 5 core contracts + extensions

---

## 📜 Smart Contract Architecture

### Contract Dependency Graph

```
TapThatXRegistry (Foundation)
    ↓
TapThatXProtocol (Core Execution)
    ↓
TapThatXConfiguration (Action Storage)
    ↓
TapThatXExecutor (Simplified Interface)
    ↓
Extensions (Aave, Bridge, etc.)
```

### Core Contracts

#### 1. **TapThatXRegistry**
**Purpose**: Chip ownership registry with EIP-712 proof of possession

**Key Functions**:
- `registerChip(address chipAddress, bytes chipSignature)` - Register chip to owner
- `getOwnerChips(address owner)` - Get all chips for an owner
- `hasChip(address owner, address chip)` - Fast ownership check

**Data Structures**:
```solidity
mapping(address => address[]) private ownerToChips;
mapping(address => address[]) private chipToOwners;
mapping(address => mapping(address => bool)) public ownerHasChip;
```

**EIP-712 Domain** (Chain-Agnostic - no chainId):
```solidity
{
  name: "TapThatXRegistry",
  version: "1",
  verifyingContract: address(this)
}
```

**Innovation**: Chips registered once work across all EVM chains.

---

#### 2. **TapThatXProtocol**
**Purpose**: Core execution engine for chip-authorized contract calls

**Key Function**:
```solidity
function executeAuthorizedCall(
    address owner,
    address target,
    bytes calldata callData,
    uint256 value,
    bytes memory chipSignature,
    uint256 timestamp,
    bytes32 nonce
) external payable returns (bool success, bytes memory returnData)
```

**Security Layers**:
1. Nonce validation (replay protection)
2. Timestamp validation (5-minute window)
3. Chip ownership verification
4. EIP-712 signature recovery
5. ReentrancyGuard protection

**Execution Flow**:
```
1. Validate nonce unused
2. Recover chip address from signature
3. Validate timestamp (within 5 minutes)
4. Verify chip ownership via Registry
5. Mark nonce as used
6. Execute: target.call{value}(callData)
7. Emit event
```

**CallAuthorization Struct** (EIP-712):
```solidity
struct CallAuthorization {
    address owner;
    address target;
    bytes callData;
    uint256 value;
    uint256 timestamp;
    bytes32 nonce;
}
```

---

#### 3. **TapThatXConfiguration**
**Purpose**: On-chain storage for pre-configured chip actions

**Data Structure**:
```solidity
struct ActionConfig {
    address targetContract;
    bytes staticCallData;
    uint256 value;
    string description;
    bool isActive;
}

mapping(address => mapping(address => ActionConfig)) public configurations;
// Structure: owner → chip → ActionConfig
```

**Key Functions**:
- `setConfiguration(...)` - Save action configuration
- `getConfiguration(address owner, address chip)` - Fetch configuration
- `toggleConfiguration(address chip)` - Enable/disable without deleting

---

#### 4. **TapThatXExecutor**
**Purpose**: Simplified interface combining configuration fetch + execution

**Key Function**:
```solidity
function executeTap(
    address owner,
    address chip,
    bytes memory chipSignature,
    uint256 timestamp,
    bytes32 nonce
) external payable returns (bool, bytes memory)
```

**Execution Steps**:
```
1. Fetch configuration from Configuration contract
2. Validate configuration exists and is active
3. Execute via Protocol.executeAuthorizedCall()
4. Emit TapExecuted event
```

**Why Use Executor?**
- Simpler: Single function call
- Safer: Validates config before execution
- Gas-efficient: Optimized for relay usage

---

#### 5. **TapThatXAuth (Library)**
**Purpose**: EIP-712 signature verification utilities

**Key Functions**:
- `recoverChipFromCallAuth(...)` - Recover chip address from signature
- `validateTimestamp(...)` - Check timestamp freshness

---

### Extension Contracts

#### **TapThatXAaveRebalancer**
- Flash loan-based Aave position rebalancing
- Calculates optimal flash loan amount
- Atomic execution: repay debt → withdraw collateral → swap → repay loan

#### **TapThatXBridgeETHViaWETH**
- Cross-chain ETH bridging (Sepolia → Base/OP)
- Unwraps WETH and bridges to multiple L2s atomically

---

## 🔄 User Flows

### 1. Registration Flow

```
User → Frontend → NFC Chip → Blockchain
  │        │          │           │
  │  1. Click "Register"          │
  │        │                      │
  │  2. Tap chip (detect)         │
  │        ├─ signMessage("init") │
  │        │<─ {address}          │
  │        │                      │
  │  3. Tap again (authorize)     │
  │        ├─ signTypedData({     │
  │        │    ChipRegistration  │
  │        │  })                   │
  │        │<─ signature          │
  │        │                      │
  │  4. Submit transaction       │
  │        ├─ registerChip() ────>│
  │        │                      │
  │        │<─ tx hash ───────────┤
  │        │                      │
  │  ✅ Chip registered           │
```

**Time**: ~30 seconds
**Actions**: 3 taps, 1 wallet approval

---

### 2. Execution Flow (Gasless)

```
User → Frontend → NFC Chip → Relay API → Blockchain
  │        │          │          │           │
  │  1. Tap chip (detect)        │           │
  │        ├─ signMessage() ────>│           │
  │        │<─ {address}         │           │
  │        │                     │           │
  │  2. Verify ownership         │           │
  │        ├─ registry.hasChip() ───────────>│
  │        │<─ true ────────────────────────┤
  │        │                     │           │
  │  3. Fetch configuration      │           │
  │        ├─ config.getConfig() ───────────>│
  │        │<─ ActionConfig ─────────────────┤
  │        │                     │           │
  │  4. Tap again (authorize)    │           │
  │        ├─ signTypedData({    │           │
  │        │    CallAuthorization│           │
  │        │  })                  │           │
  │        │<─ signature         │           │
  │        │                     │           │
  │  5. Send to relay            │           │
  │        ├─ POST /api/relay ──>│           │
  │        │                     │           │
  │        │   Relay validates   │           │
  │        │   Sets gas limit    │           │
  │        │   Submits tx        │           │
  │        │                     ├─ executeTap() ──>│
  │        │                     │           │
  │        │                     │   Protocol validates
  │        │                     │   Executes target.call()
  │        │                     │           │
  │        │<─ {txHash} ─────────┤           │
  │        │                     │           │
  │  ✅ Transaction executed     │           │
```

**Time**: ~3 seconds
**Actions**: 2 taps
**Gas Paid By**: Relay (user pays $0)

---

## 🎨 Frontend Architecture

### Tech Stack

- **Next.js 15** (App Router)
- **React 19** + **TypeScript**
- **Wagmi 2.16** - Ethereum hooks
- **Viem 2.34** - TypeScript Ethereum library
- **@arx-research/libhalo 1.3.2** - NFC chip communication
- **Web NFC API** - Browser-based NFC reading

### Key Pages

```
app/
├── register/page.tsx    → Chip registration
├── approve/page.tsx     → Token approvals
├── configure/page.tsx   → Action configuration
└── execute/page.tsx     → Tap-to-execute
```

### Custom Hooks

#### **useHaloChip**
```typescript
const { signMessage, signTypedData, isLoading, error } = useHaloChip();

// Chip detection
const { address, signature } = await signMessage({
  message: "init",
  format: "text"
});

// EIP-712 signing
const { address, signature } = await signTypedData({
  domain: { name: "TapThatXProtocol", version: "1", verifyingContract },
  types: { CallAuthorization: [...] },
  primaryType: "CallAuthorization",
  message: { owner, target, callData, value, timestamp, nonce }
});
```

#### **useGaslessRelay**
```typescript
const { relayExecuteTap } = useGaslessRelay();

const result = await relayExecuteTap({
  owner: "0x...",
  chip: "0x...",
  chipSignature: "0x...",
  timestamp: 1234567890,
  nonce: "0x...",
});
// Returns: { success: true, transactionHash: "0x...", blockNumber: "12345" }
```

### Action Templates

**Purpose**: Build callData for common DeFi operations

**ERC20 Transfer Template**:
```typescript
const erc20TransferTemplate = {
  id: "erc20-transfer",
  buildCallData: (params: {
    tokenAddress: `0x${string}`;
    from: `0x${string}`;
    to: `0x${string}`;
    amount: bigint;
  }) => {
    const callData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "transferFrom",
      args: [params.from, params.to, params.amount],
    });
    return { target: params.tokenAddress, callData, value: 0n };
  },
};
```

---

## 🔧 Backend Relay Architecture

### API Endpoint: `/api/relay-execute-tap`

**Purpose**: Gasless transaction execution

**Flow**:
```
1. Receive request with chip signature
2. Validate input structure
3. Detect operation type (simple/Aave/bridge)
4. Set appropriate gas limit:
   - Simple: auto-estimate
   - Aave: 1.5M
   - Bridge: 3M
5. Submit transaction using RELAYER_PRIVATE_KEY
6. Wait for receipt
7. Return transaction hash
```

**Key Features**:
- Private key validation and normalization
- Dynamic gas limit detection
- Balance checking for value transfers
- Error handling and clear messages

**Environment Variable**:
```env
RELAYER_PRIVATE_KEY=0x... (64 hex chars, must start with 0x)
```

---

## 🔒 Security Model

### Multi-Layer Validation

```
1. Signature Validation
   - EIP-712 format
   - Recover chip address
   - Verify signature

2. Ownership Verification
   - registry.hasChip(owner, chip)
   - Bidirectional mapping check

3. Timestamp Validation
   - Not in future
   - Within 5-minute window
   - Prevents stale signatures

4. Nonce Replay Protection
   - Check unused
   - Mark as used
   - Prevents signature reuse

5. Execution Safety
   - ReentrancyGuard
   - target.call() with value
   - Return success status
```

### Security Features

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| Replay Protection | `mapping(bytes32 => bool) usedNonces` | Prevent signature reuse |
| Timestamp Validation | 5-minute window | Prevent stale signatures |
| Ownership Verification | Registry mapping | Ensure chip belongs to owner |
| ReentrancyGuard | OpenZeppelin | Prevent reentrancy attacks |
| Secure Element | HaLo chip | Private key never leaves chip |

---

## 💡 Key Technical Innovations

### 1. Chain-Agnostic Domain Separator

**Standard EIP-712** (chain-locked):
```solidity
// Includes chainId - locks to specific chain
EIP712Domain(..., chainId, ...)
```

**TapThatX** (cross-chain):
```solidity
// No chainId - works on any chain
EIP712Domain(..., verifyingContract)
```

**Benefit**: Register chip once → use on any EVM chain.

---

### 2. BigInt Serialization

**Problem**: HaLo library uses JSON (no BigInt), but Viem uses BigInt.

**Solution**: Recursive BigInt → string conversion before NFC signing.

```typescript
const serializeBigInt = (obj: any): any => {
  if (typeof obj === "bigint") return obj.toString();
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, serializeBigInt(v)])
  );
};
```

---

### 3. Gasless via transferFrom Pattern

**Traditional Gasless** (requires trust):
```
User sends tokens to relayer → Relayer submits
❌ Risk: Relayer could steal
```

**TapThatX Gasless** (trustless):
```solidity
// User approves once
IERC20(token).approve(extensionAddress, maxUint256);

// Extension pulls during execution
IERC20(token).transferFrom(owner, address(this), amount);

// Smart contract validates chip signature
require(registry.hasChip(owner, chip), "Ownership validation");
```

**Security**: Relay pays gas but cannot steal funds. On-chain validation prevents forgery.

---

## 📊 Performance Metrics

| Operation | Gas | Time | User Cost |
|-----------|-----|------|-----------|
| Register Chip | 150k | ~30s | Paid once |
| Configure Action | 80k | ~30s | Paid once |
| Execute ERC20 Transfer | 130k | ~3s | **$0 (relayed)** |
| Aave Rebalance | 1.5M | ~60s | **$0 (relayed)** |
| Bridge to 2 L2s | 3M | ~2min | **$0 (relayed)** |

**Key Insight**: Users pay setup costs once, then execute unlimited actions gaslessly.

---

## 🛠️ Technology Stack

### Smart Contracts
- **Foundry** - Development framework
- **Solidity** ^0.8.19
- **OpenZeppelin** - EIP712, ECDSA, ReentrancyGuard, Ownable

### Frontend
- **Next.js 15** (App Router)
- **React 19** + **TypeScript 5**
- **Wagmi 2.16** - React hooks for Ethereum
- **Viem 2.34** - TypeScript Ethereum library
- **@arx-research/libhalo 1.3.2** - NFC chip communication

### Infrastructure
- **Base Sepolia** - L2 deployment (2s blocks, <$0.01 gas)
- **Ethereum Sepolia** - L1 deployment
- **Alchemy** - RPC provider (optional)

### Hardware
- **Arx HaLo NFC Chips** - Secure element with EIP-712 signing
- **Web NFC API** - Browser-based NFC reading (Android Chrome)

---

## 🔄 Implementation Checklist for Hedera

### Smart Contracts (Hedera Smart Contract Service)

1. **TapThatXRegistry**
   - Map chip addresses to owner addresses
   - EIP-712 signature verification (adapt to Hedera's signature format)
   - Chain-agnostic domain separator

2. **TapThatXProtocol**
   - Generic execution engine
   - Nonce-based replay protection
   - Timestamp validation
   - Chip ownership verification

3. **TapThatXConfiguration**
   - Store action configurations
   - Enable/disable toggle

4. **TapThatXExecutor**
   - Simplified execution interface
   - Fetch config + execute

5. **TapThatXAuth (Library)**
   - Signature recovery utilities
   - Timestamp validation

### Frontend Adaptations

1. **Replace Wagmi/Viem** with Hedera SDK
   - Use `@hashgraph/sdk` for Hedera interactions
   - Adapt wallet connection to Hedera wallets

2. **NFC Integration** (No changes needed)
   - `@arx-research/libhalo` works the same
   - Web NFC API is platform-agnostic

3. **Backend Relay**
   - Replace `viem` with Hedera SDK
   - Use Hedera account for relayer
   - Adapt transaction submission to Hedera format

### Key Differences for Hedera

1. **Account System**: Hedera uses account IDs, not addresses
2. **Signature Format**: Hedera uses Ed25519, not ECDSA
3. **Transaction Format**: Different structure than EVM
4. **Gas Model**: Hedera uses fees, not gas
5. **Smart Contracts**: Hedera Smart Contract Service (EVM-compatible)

### Hedera-Specific Considerations

1. **Account IDs**: Map chip addresses to Hedera account IDs
2. **Signature Verification**: Adapt EIP-712 to Hedera's signature format
3. **Transaction Fees**: Relayer pays Hedera fees (HBAR)
4. **Smart Contract Calls**: Use Hedera's contract call format
5. **Token Transfers**: Use Hedera Token Service (HTS) or smart contracts

---

## 📝 Key Files Reference

### Smart Contracts
- `packages/foundry/contracts/core/TapThatXRegistry.sol`
- `packages/foundry/contracts/core/TapThatXProtocol.sol`
- `packages/foundry/contracts/core/TapThatXConfiguration.sol`
- `packages/foundry/contracts/core/TapThatXExecutor.sol`
- `packages/foundry/contracts/core/TapThatXAuth.sol`

### Frontend
- `packages/nextjs/app/register/page.tsx` - Registration flow
- `packages/nextjs/app/execute/page.tsx` - Execution flow
- `packages/nextjs/hooks/useHaloChip.ts` - NFC integration
- `packages/nextjs/hooks/useGaslessRelay.ts` - Relay API

### Backend
- `packages/nextjs/app/api/relay-execute-tap/route.ts` - Gasless relay

### Utilities
- `packages/nextjs/utils/actionTemplates.ts` - CallData builders

---

## 🎯 Core Concepts Summary

1. **NFC Chip Registration**: One-time setup linking chip to wallet
2. **Action Configuration**: Pre-configure what happens on tap
3. **Gasless Execution**: Relay pays fees, user taps to execute
4. **Universal Actions**: Any contract call, not just payments
5. **Hardware Security**: Private keys never leave NFC chip
6. **Chain-Agnostic**: Register once, use anywhere

---

## 🚀 Quick Start for Hedera Implementation

1. **Adapt Smart Contracts** to Hedera Smart Contract Service
2. **Replace EVM libraries** with Hedera SDK
3. **Map addresses to account IDs** in Registry
4. **Adapt signature verification** to Hedera format
5. **Set up Hedera relayer account** with HBAR
6. **Test NFC integration** (should work unchanged)
7. **Deploy contracts** to Hedera testnet
8. **Test full flow**: Register → Configure → Execute

---

This summary provides all the essential information needed to implement TapThatX on Hedera. The core architecture and flows remain the same; the main adaptations are in the blockchain interaction layer (Hedera SDK instead of Viem/Wagmi) and signature format (Hedera's Ed25519 instead of ECDSA).


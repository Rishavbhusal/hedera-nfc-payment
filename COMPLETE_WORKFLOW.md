# 📘 Complete TapThatX Workflow Explanation

## 🎯 Overview

This document explains **every single step** of the TapThatX system - from NFC chip registration to executing transactions. Each step is broken down with technical details, code references, and data flows.

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TapThatX System                           │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  NFC Chip    │◄────►│  Frontend    │◄────►│   Backend    │
│  (HaLo)      │      │  (Next.js)   │      │   (Relay)    │
│              │      │              │      │              │
│ Private Key  │      │ Web NFC API  │      │ API Endpoint │
│ Never Leaves │      │ React Hooks  │      │ Viem/Wagmi   │
└──────────────┘      └──────────────┘      └──────┬───────┘
                                                   │
                                                   ▼
                                          ┌──────────────┐
                                          │  Blockchain  │
                                          │  (Smart      │
                                          │   Contracts) │
                                          └──────────────┘
```

---

## 📋 Three Main Workflows

1. **Registration Flow** - Link NFC chip to your wallet (one-time setup)
2. **Configuration Flow** - Set up what happens when you tap (one-time per action)
3. **Execution Flow** - Tap chip to execute action (gasless, instant)

---

## 🔵 WORKFLOW 1: Chip Registration

**Goal**: Prove you own the physical NFC chip and link it to your wallet address.

**Time**: ~30 seconds  
**Cost**: One-time gas fee (you pay)  
**Location**: `/register` page

### Step-by-Step Breakdown

#### **Step 1: User Clicks "Start Registration"**

**File**: `packages/nextjs/app/register/page.tsx:57`

```typescript
const handleRegister = async () => {
  // Validates wallet is connected
  if (!address) {
    setStatusMessage("Please connect your wallet first");
    return;
  }
}
```

**What Happens**:
- Checks if MetaMask/wallet is connected
- Validates that `TapThatXRegistry` contract is deployed on current network
- Sets UI state to "reading"

---

#### **Step 2: First NFC Tap - Chip Detection**

**File**: `packages/nextjs/app/register/page.tsx:75`

```typescript
setFlowState("reading");
setStatusMessage("Hold your device near the NFC chip...");

const chipData = await signMessage({ message: "init", format: "text" });
const detectedChipAddress = chipData.address as `0x${string}`;
```

**What Happens Behind the Scenes**:

1. **Frontend calls `useHaloChip` hook** (`packages/nextjs/hooks/useHaloChip.ts:67`)
   ```typescript
   const signMessage = async ({ message, format }) => {
     const command = {
       name: "sign",
       keyNo: 1,
       message: "init",
       format: "text"
     };
   ```

2. **Hook calls `@arx-research/libhalo` library**
   ```typescript
   const result = await execHaloCmdWeb(command);
   ```

3. **Web NFC API activates** (Browser built-in)
   - Browser requests NFC permission (if first time)
   - Phone's NFC reader powers up
   - Waits for chip to come within range (2-3 seconds)

4. **NFC Chip receives command**
   - HaLo chip receives "sign" command with message "init"
   - Chip's secure element (private key) signs the message
   - **Private key NEVER leaves the chip** (hardware security)

5. **Chip returns signature**
   ```typescript
   return {
     address: result.etherAddress,  // Chip's public address (0x...)
     signature: result.signature.ether  // Signature proving ownership
   };
   ```

**Result**: Frontend now knows the chip's Ethereum address (e.g., `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`)

---

#### **Step 3: Second NFC Tap - EIP-712 Authorization**

**File**: `packages/nextjs/app/register/page.tsx:86`

```typescript
setFlowState("signing");
setStatusMessage("Tap your chip again to authorize registration...");

const registrationSig = await signTypedData({
  domain: {
    name: "TapThatXRegistry",
    version: "1",
    verifyingContract: registryAddress,  // No chainId! (chain-agnostic)
  },
  types: {
    ChipRegistration: [
      { name: "owner", type: "address" },
      { name: "chipAddress", type: "address" },
    ],
  },
  primaryType: "ChipRegistration",
  message: {
    owner: address,  // Your wallet address
    chipAddress: detectedChipAddress,  // Chip's address from Step 2
  },
});
```

**What Happens**:

1. **Frontend prepares EIP-712 structured data**
   - Creates typed data structure (standard format for signing)
   - Includes your wallet address and chip address
   - **Important**: No `chainId` in domain (makes it chain-agnostic)

2. **BigInt Serialization** (`packages/nextjs/hooks/useHaloChip.ts:7`)
   ```typescript
   const serializeBigInt = (obj: any): any => {
     if (typeof obj === "bigint") return obj.toString();
     // Recursively converts all BigInts to strings
   };
   ```
   - NFC library uses JSON (no BigInt support)
   - Converts all BigInt values to strings before sending

3. **Chip signs EIP-712 message**
   - Chip receives typed data structure
   - Signs with its private key
   - Returns signature: `0x1234...abcd`

**Result**: You have a signature proving the chip authorizes linking to your wallet.

---

#### **Step 4: Submit On-Chain Transaction**

**File**: `packages/nextjs/app/register/page.tsx:112`

```typescript
setFlowState("confirming");
setStatusMessage("Please confirm the transaction in your wallet...");

writeContract({
  address: registryAddress,
  abi: registryAbi,
  functionName: "registerChip",
  args: [detectedChipAddress, registrationSig.signature],
});
```

**What Happens**:

1. **Wagmi prepares transaction**
   - Encodes function call: `registerChip(address, bytes)`
   - Estimates gas
   - Shows MetaMask popup

2. **User approves in MetaMask**
   - Sees transaction details
   - Confirms (pays gas fee)

3. **Transaction sent to blockchain**
   - Transaction hash: `0xabc123...`

---

#### **Step 5: Smart Contract Validation**

**File**: `packages/foundry/contracts/core/TapThatXRegistry.sol:29`

```solidity
function registerChip(address chipAddress, bytes memory chipSignature) external {
    require(chipAddress != address(0), "Invalid chip address");
    require(!ownerHasChip[msg.sender][chipAddress], "Chip already registered");
    
    // Build EIP-712 digest
    bytes32 structHash = keccak256(abi.encode(
        REGISTRATION_TYPEHASH,
        msg.sender,  // Your wallet (from transaction)
        chipAddress  // Chip address
    ));
    
    bytes32 digest = keccak256(abi.encodePacked(
        "\x19\x01",
        _chainAgnosticDomainSeparator(),  // No chainId!
        structHash
    ));
    
    // Recover signer from signature
    address signer = digest.recover(chipSignature);
    
    // Verify signer is the chip
    require(signer == chipAddress, "Invalid chip signature");
    
    // Store ownership
    ownerToChips[msg.sender].push(chipAddress);
    chipToOwners[chipAddress].push(msg.sender);
    ownerHasChip[msg.sender][chipAddress] = true;
    
    emit ChipRegistered(chipAddress, msg.sender);
}
```

**Validation Steps**:

1. **Checks chip not already registered** to this owner
2. **Rebuilds EIP-712 digest** (same way frontend did)
3. **Recovers signer address** from signature using ECDSA
4. **Verifies signer == chipAddress** (proves chip signed it)
5. **Stores ownership** in three mappings:
   - `ownerToChips[yourWallet] = [chipAddress]`
   - `chipToOwners[chipAddress] = [yourWallet]`
   - `ownerHasChip[yourWallet][chipAddress] = true`

**Result**: Chip is now registered to your wallet on-chain!

---

#### **Step 6: Transaction Confirmation**

**File**: `packages/nextjs/app/register/page.tsx:49`

```typescript
useEffect(() => {
  if (isConfirmed && detectedChip) {
    setFlowState("success");
    setStatusMessage("Success! Chip registered on-chain.");
  }
}, [isConfirmed, detectedChip]);
```

**What Happens**:
- Frontend waits for transaction receipt
- Once confirmed, shows success message
- Chip is now ready to use!

---

## 🟢 WORKFLOW 2: Action Configuration

**Goal**: Set up what happens when you tap the chip (e.g., "Send 10 USDC to Alice").

**Time**: ~30 seconds  
**Cost**: One-time gas fee (you pay)  
**Location**: `/configure` page

### Step-by-Step Breakdown

#### **Step 1: User Selects Chip and Action Type**

**File**: `packages/nextjs/app/configure/page.tsx:117`

```typescript
// User selects from registered chips
const registeredChips = (ownerChipsData as string[]) || [];

// User selects action template (e.g., "ERC20 Transfer")
const selectedTemplate = "erc20-transfer";
```

**Available Templates**:
- **ERC20 Transfer**: Send tokens to an address
- **Avail Bridge**: Bridge ETH to another chain
- (More can be added)

---

#### **Step 2: User Fills in Action Details**

**File**: `packages/nextjs/app/configure/page.tsx:36`

For ERC20 Transfer:
```typescript
const [tokenAddress, setTokenAddress] = useState<string>("");
const [recipient, setRecipient] = useState<string>("");
const [amount, setAmount] = useState<string>("");
const [description, setDescription] = useState<string>("");
```

**Example**:
- Token: `0xb090ae6dd89b25d1b79718853c439d1354bf62c5` (MockUSDC)
- Recipient: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
- Amount: `10.00`
- Description: "Send 10 USDC to Alice"

---

#### **Step 3: Build CallData**

**File**: `packages/nextjs/app/configure/page.tsx:184`

```typescript
const template = actionTemplates.find(t => t.id === selectedTemplate);

// For ERC20 transfer
callDataResult = template.buildCallData({
  tokenAddress: checksummedTokenAddress,
  from: address!,  // Your wallet
  to: checksummedRecipient,
  amount: amountBigInt,  // 10 * 10^6 (USDC has 6 decimals)
});
```

**What `buildCallData` Does** (`packages/nextjs/utils/actionTemplates.ts`):

```typescript
const erc20TransferTemplate = {
  buildCallData: (params) => {
    // Encode function call: transferFrom(owner, recipient, amount)
    const callData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "transferFrom",
      args: [params.from, params.to, params.amount],
    });
    
    return {
      target: params.tokenAddress,  // USDC contract
      callData: "0xa9059cbb0000...",  // Encoded function call
      value: 0n  // No ETH sent
    };
  }
};
```

**Result**: 
- `target`: `0xb090ae6dd89b25d1b79718853c439d1354bf62c5` (USDC contract)
- `callData`: `0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb0000000000000000000000000000000000000000000000000000000000989680`
  - Function selector: `0xa9059cbb` (transferFrom)
  - Args: `[from, to, 10000000]` (10 USDC with 6 decimals)

---

#### **Step 4: Submit Configuration to Blockchain**

**File**: `packages/nextjs/app/configure/page.tsx:227`

```typescript
writeContract({
  address: configurationAddress,
  abi: configurationAbi,
  functionName: "setConfiguration",
  args: [
    chipAddressForContract,
    callDataResult.target,      // USDC contract
    callDataResult.callData,     // Encoded transferFrom()
    callDataResult.value || 0n,  // 0 ETH
    finalDescription,            // "Send 10 USDC to Alice"
  ],
});
```

---

#### **Step 5: Smart Contract Stores Configuration**

**File**: `packages/foundry/contracts/core/TapThatXConfiguration.sol`

```solidity
struct ActionConfig {
    address targetContract;    // USDC contract
    bytes staticCallData;      // Encoded transferFrom()
    uint256 value;             // 0 ETH
    string description;        // "Send 10 USDC to Alice"
    bool isActive;             // true
}

mapping(address => mapping(address => ActionConfig)) public configurations;
// Structure: owner → chip → ActionConfig

function setConfiguration(
    address chip,
    address targetContract,
    bytes calldata staticCallData,
    uint256 value,
    string calldata description
) external {
    configurations[msg.sender][chip] = ActionConfig({
        targetContract: targetContract,
        staticCallData: staticCallData,
        value: value,
        description: description,
        isActive: true
    });
    
    emit ConfigurationSet(msg.sender, chip, targetContract, description);
}
```

**Result**: Configuration stored on-chain:
- When you tap this chip, it will execute: `USDC.transferFrom(yourWallet, alice, 10 USDC)`

---

## 🟡 WORKFLOW 3: Tap to Execute (Gasless!)

**Goal**: Execute the pre-configured action by tapping your chip (relayer pays gas).

**Time**: ~3 seconds  
**Cost**: $0 (relayer pays gas)  
**Location**: `/execute` page

### Step-by-Step Breakdown

#### **Step 1: First NFC Tap - Chip Detection**

**File**: `packages/nextjs/app/execute/page.tsx:64`

```typescript
setFlowState("detecting");
setStatusMessage("Hold your device near the NFC chip...");

const chipData = await signMessage({ message: "init", format: "text" });
const detectedChipAddress = chipData.address as `0x${string}`;
```

**Same as Registration Step 2** - detects chip address.

---

#### **Step 2: Verify Chip Ownership**

**File**: `packages/nextjs/app/execute/page.tsx:68`

```typescript
const hasChip = await publicClient.readContract({
  address: REGISTRY_ADDRESS,
  abi: contracts.TapThatXRegistry.abi,
  functionName: "hasChip",
  args: [address, detectedChipAddress],
});

if (!hasChip) {
  setStatusMessage("Chip not registered. Please register at /register.");
  return;
}
```

**What Happens**:
- Calls `TapThatXRegistry.hasChip(owner, chip)`
- Returns `true` if chip is registered to your wallet
- If `false`, stops execution

---

#### **Step 3: Fetch Configuration**

**File**: `packages/nextjs/app/execute/page.tsx:84`

```typescript
const config = await publicClient.readContract({
  address: CONFIGURATION_ADDRESS,
  abi: contracts.TapThatXConfiguration.abi,
  functionName: "getConfiguration",
  args: [address, detectedChipAddress],
});
```

**Returns**:
```typescript
{
  targetContract: "0xb090ae6dd89b25d1b79718853c439d1354bf62c5",  // USDC
  staticCallData: "0xa9059cbb0000...",  // transferFrom()
  value: 0n,
  description: "Send 10 USDC to Alice",
  isActive: true
}
```

**Validation**:
- Checks configuration exists (not `0x0`)
- Checks `isActive === true`

---

#### **Step 4: Generate Nonce and Timestamp**

**File**: `packages/nextjs/app/execute/page.tsx:111`

```typescript
const timestamp = Math.floor(Date.now() / 1000);  // Current Unix timestamp
const nonce = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
  .map(b => b.toString(16).padStart(2, "0"))
  .join("")}` as `0x${string}`;
```

**Purpose**:
- **Nonce**: Prevents replay attacks (each signature can only be used once)
- **Timestamp**: Prevents stale signatures (must be within 5 minutes)

---

#### **Step 5: Second NFC Tap - EIP-712 Authorization**

**File**: `packages/nextjs/app/execute/page.tsx:116`

```typescript
setFlowState("authorizing");
setStatusMessage("Tap your chip again to authorize execution...");

const chipSig = await signTypedData({
  domain: {
    name: "TapThatXProtocol",
    version: "1",
    verifyingContract: PROTOCOL_ADDRESS,  // No chainId!
  },
  types: {
    CallAuthorization: [
      { name: "owner", type: "address" },
      { name: "target", type: "address" },
      { name: "callData", type: "bytes" },
      { name: "value", type: "uint256" },
      { name: "timestamp", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  },
  primaryType: "CallAuthorization",
  message: {
    owner: address,                    // Your wallet
    target: config.targetContract,     // USDC contract
    callData: config.staticCallData,   // transferFrom()
    value: config.value,               // 0
    timestamp: BigInt(timestamp),      // Current time
    nonce,                             // Random nonce
  },
});
```

**What Chip Signs**:
- **Owner**: Your wallet address
- **Target**: USDC contract address
- **CallData**: Encoded `transferFrom()` function
- **Value**: 0 ETH
- **Timestamp**: Current time
- **Nonce**: Random 32-byte value

**Result**: Chip signature authorizing this exact transaction.

---

#### **Step 6: Send to Gasless Relay**

**File**: `packages/nextjs/app/execute/page.tsx:150`

```typescript
setFlowState("executing");
setStatusMessage("Executing action on blockchain...");

const result = await relayExecuteTap({
  owner: address,
  chip: detectedChipAddress,
  chipSignature: chipSig.signature,
  timestamp,
  nonce,
  value: config.value,
});
```

**Hook Implementation** (`packages/nextjs/hooks/useGaslessRelay.ts:6`):

```typescript
const relayExecuteTap = async (executeData) => {
  const response = await fetch("/api/relay-execute-tap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...executeData,
      value: executeData.value?.toString(),  // BigInt → string
      chainId,
    }),
  });
  
  return await response.json();
};
```

**Sends POST to**: `/api/relay-execute-tap`

**Payload**:
```json
{
  "owner": "0x...",
  "chip": "0x...",
  "chipSignature": "0x...",
  "timestamp": 1234567890,
  "nonce": "0x...",
  "value": "0",
  "chainId": 84532
}
```

---

#### **Step 7: Backend Relay Validates and Executes**

**File**: `packages/nextjs/app/api/relay-execute-tap/route.ts:40`

**7a. Validate Inputs** (line 46)
```typescript
if (!owner || !chip || !chipSignature || !timestamp || !nonce || !chainId) {
  return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
}
```

**7b. Setup Relayer Wallet** (line 82)
```typescript
const account = privateKeyToAccount(RELAYER_PRIVATE_KEY);
const client = createWalletClient({
  account,
  chain: chainConfig,
  transport: http(rpcUrl),
}).extend(publicActions);
```

**7c. Fetch Configuration** (line 100)
```typescript
const configuration = await publicClient.readContract({
  address: contracts.TapThatXConfiguration.address,
  abi: contracts.TapThatXConfiguration.abi,
  functionName: "getConfiguration",
  args: [owner, chip],
});
```

**7d. Detect Action Type** (line 173)
```typescript
// Check if Aave rebalancer (needs 1.5M gas)
const isAaveRebalancer = 
  configuration.targetContract?.toLowerCase() === 
  contracts.TapThatXAaveRebalancer.address?.toLowerCase();

// Check if bridge extension (needs 3M gas)
const isBridgeExtension = 
  configuration.targetContract?.toLowerCase() === 
  contracts.TapThatXBridgeETHViaWETH.address?.toLowerCase();
```

**7e. Submit Transaction** (line 205)
```typescript
const hash = await client.writeContract({
  address: contracts.TapThatXExecutor.address,
  abi: contracts.TapThatXExecutor.abi,
  functionName: "executeTap",
  args: [
    owner,
    chip,
    chipSignature,
    BigInt(timestamp),
    nonce,
  ],
  value: valueToSend,  // 0n for ERC20 transfers
  gas: isAaveRebalancer
    ? BigInt(1_500_000)  // High gas for flash loans
    : isBridgeExtension
      ? BigInt(3_000_000)  // High gas for bridges
      : undefined,  // Auto-estimate for others
});
```

**Important**: Relayer pays gas fee (you pay $0!)

---

#### **Step 8: TapThatXExecutor.executeTap()**

**File**: `packages/foundry/contracts/core/TapThatXExecutor.sol:40`

```solidity
function executeTap(
    address owner,
    address chip,
    bytes memory chipSignature,
    uint256 timestamp,
    bytes32 nonce
) external payable returns (bool success, bytes memory returnData) {
    // Fetch configuration
    ActionConfig memory config = configuration.getConfiguration(owner, chip);
    
    // Validate
    require(config.targetContract != address(0), "No configuration exists");
    require(config.isActive, "Configuration is inactive");
    require(msg.value >= config.value, "Insufficient ETH sent");
    
    // Execute via Protocol
    (success, returnData) = protocol.executeAuthorizedCall{value: config.value}(
        owner,
        config.targetContract,      // USDC contract
        config.staticCallData,       // transferFrom()
        config.value,
        chipSignature,
        timestamp,
        nonce
    );
    
    emit TapExecuted(owner, chip, config.targetContract, nonce, success, config.description);
    
    return (success, returnData);
}
```

**What Happens**:
1. Fetches configuration from `TapThatXConfiguration`
2. Validates configuration exists and is active
3. Calls `TapThatXProtocol.executeAuthorizedCall()` with all parameters

---

#### **Step 9: TapThatXProtocol.executeAuthorizedCall()**

**File**: `packages/foundry/contracts/core/TapThatXProtocol.sol:45`

```solidity
function executeAuthorizedCall(
    address owner,
    address target,
    bytes calldata callData,
    uint256 value,
    bytes memory chipSignature,
    uint256 timestamp,
    bytes32 nonce
) external payable nonReentrant returns (bool success, bytes memory returnData) {
    require(owner != address(0), "Invalid owner");
    require(target != address(0), "Invalid target");
    require(msg.value >= value, "Insufficient ETH sent");
    
    // SECURITY CHECK 1: Nonce not used
    require(!usedNonces[nonce], "Nonce already used");
    
    // SECURITY CHECK 2: Verify chip signature
    address chip = _verifyChipAuth(owner, target, callData, value, timestamp, nonce, chipSignature);
    
    // SECURITY CHECK 3: Verify chip ownership
    require(registry.hasChip(owner, chip), "Owner does not have chip");
    
    // Mark nonce as used (prevent replay)
    usedNonces[nonce] = true;
    emit NonceUsed(nonce);
    
    // EXECUTE: Call target contract
    (success, returnData) = target.call{ value: value }(callData);
    
    emit AuthorizedCallExecuted(owner, chip, target, callData, value, nonce, success);
    
    return (success, returnData);
}
```

**Security Validation** (`_verifyChipAuth` - line 96):

```solidity
function _verifyChipAuth(...) internal view returns (address) {
    // Build CallAuthorization struct
    CallAuthorization memory auth = CallAuthorization({
        owner: owner,
        target: target,
        callData: callData,
        value: value,
        timestamp: timestamp,
        nonce: nonce
    });
    
    // SECURITY CHECK: Timestamp within 5 minutes
    require(
        TapThatXAuth.validateTimestamp(timestamp, MAX_TIMESTAMP_WINDOW),
        "Authorization expired"
    );
    
    // SECURITY CHECK: Recover chip address from signature
    address chip = TapThatXAuth.recoverChipFromCallAuth(
        _chainAgnosticDomainSeparator(),
        auth,
        signature
    );
    
    require(chip != address(0), "Invalid chip signature");
    
    return chip;
}
```

**Validation Steps**:
1. ✅ **Nonce check**: `usedNonces[nonce] == false`
2. ✅ **Timestamp check**: Within 5 minutes of current time
3. ✅ **Signature recovery**: Recover chip address from EIP-712 signature
4. ✅ **Ownership check**: `registry.hasChip(owner, chip) == true`

**If all pass**: Execute `target.call(callData)`

---

#### **Step 10: Execute Target Contract**

**In our example**: USDC contract receives call

```solidity
// Protocol executes:
USDC.transferFrom(owner, recipient, amount)
```

**What Happens**:
- USDC contract checks: `allowance(owner, TapThatXProtocol) >= amount`
- If approved: Transfers tokens from `owner` to `recipient`
- Returns success/failure

**Note**: User must approve `TapThatXProtocol` to spend tokens first (done at `/approve` page).

---

#### **Step 11: Transaction Confirmed**

**File**: `packages/nextjs/app/api/relay-execute-tap/route.ts:225`

```typescript
// Wait for transaction receipt
const receipt = await client.waitForTransactionReceipt({ hash });

return NextResponse.json({
  success: true,
  transactionHash: hash,
  blockNumber: receipt.blockNumber.toString(),
});
```

**Frontend receives**:
```json
{
  "success": true,
  "transactionHash": "0xabc123...",
  "blockNumber": "12345"
}
```

**Frontend displays** (`packages/nextjs/app/execute/page.tsx:167`):
```typescript
setFlowState("success");
setStatusMessage(`Success! Action executed: ${config.description}`);
```

---

## 🔒 Security Layers Explained

### 1. **Replay Protection (Nonce)**
- Each signature includes unique nonce
- Once used, nonce is marked as used
- Prevents reusing same signature

### 2. **Timestamp Validation**
- Signatures expire after 5 minutes
- Prevents using old/stale signatures
- Protects against time-based attacks

### 3. **Chip Ownership Verification**
- Only registered chips can authorize actions
- Registry stores bidirectional mapping
- Prevents unauthorized chip usage

### 4. **EIP-712 Signature Verification**
- Recover chip address from signature
- Verify signature matches chip's private key
- Proves chip physically signed authorization

### 5. **ReentrancyGuard**
- Prevents reentrancy attacks
- Locks contract during execution
- Standard OpenZeppelin protection

---

## 🔑 Key Technical Concepts

### **EIP-712 Structured Data Signing**

**Purpose**: Sign complex data structures (not just plain text)

**Structure**:
```typescript
{
  domain: {
    name: "TapThatXProtocol",
    version: "1",
    verifyingContract: "0x...",  // No chainId!
  },
  types: {
    CallAuthorization: [
      { name: "owner", type: "address" },
      { name: "target", type: "address" },
      // ...
    ],
  },
  primaryType: "CallAuthorization",
  message: {
    owner: "0x...",
    target: "0x...",
    // ...
  },
}
```

**Why Chain-Agnostic?**
- Standard EIP-712 includes `chainId` in domain
- TapThatX **excludes** `chainId`
- Allows same signature to work on any EVM chain
- Register chip once → use on Ethereum, Base, Arbitrum, etc.

### **BigInt Serialization**

**Problem**: 
- Viem uses `BigInt` for large numbers
- NFC library uses JSON (no BigInt support)
- Need to convert before sending to chip

**Solution** (`packages/nextjs/hooks/useHaloChip.ts:7`):
```typescript
const serializeBigInt = (obj: any): any => {
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, serializeBigInt(v)])
    );
  }
  return obj;
};
```

### **Gasless Execution Pattern**

**Traditional Gasless**:
- User sends tokens to relayer
- Relayer executes transaction
- ❌ Risk: Relayer could steal tokens

**TapThatX Gasless**:
- User approves `TapThatXProtocol` to spend tokens
- Relayer calls `executeTap()` (pays gas)
- Protocol validates chip signature
- Protocol executes `transferFrom(owner, recipient, amount)`
- ✅ Secure: Relayer cannot steal (on-chain validation)

---

## 📊 Complete Flow Diagram

```
REGISTRATION FLOW:
User → Frontend → NFC Chip → Blockchain
  │       │          │           │
  │   1. Tap        │           │
  │   ─────────────>│           │
  │   <─ address    │           │
  │       │          │           │
  │   2. Tap        │           │
  │   ─────────────>│           │
  │   <─ signature  │           │
  │       │          │           │
  │   3. Submit tx  │           │
  │   ──────────────────────────>│
  │       │          │           │
  │   <─ tx hash ────────────────┤
  │       │          │           │
  │   ✅ Registered              │

CONFIGURATION FLOW:
User → Frontend → Blockchain
  │       │           │
  │   1. Fill form   │
  │       │           │
  │   2. Build       │
  │   callData       │
  │       │           │
  │   3. Submit tx   │
  │   ──────────────>│
  │       │           │
  │   <─ tx hash ────┤
  │       │           │
  │   ✅ Configured  │

EXECUTION FLOW (GASLESS):
User → Frontend → NFC Chip → Relay API → Blockchain
  │       │          │          │           │
  │   1. Tap        │          │           │
  │   ─────────────>│          │           │
  │   <─ address    │          │           │
  │       │          │          │           │
  │   2. Verify     │          │           │
  │   ownership ──────────────────────────>│
  │   <─ true ────────────────────────────┤
  │       │          │          │           │
  │   3. Fetch      │          │           │
  │   config ─────────────────────────────>│
  │   <─ config ──────────────────────────┤
  │       │          │          │           │
  │   4. Tap        │          │           │
  │   ─────────────>│          │           │
  │   <─ signature  │          │           │
  │       │          │          │           │
  │   5. Send to    │          │           │
  │   relay ────────>│          │           │
  │       │          │          │           │
  │       │          │  6. Validate        │
  │       │          │  7. Submit tx       │
  │       │          │  ──────────────────>│
  │       │          │          │           │
  │       │          │          │  8. Protocol validates
  │       │          │          │  9. Execute target.call()
  │       │          │          │           │
  │       │          │<─ tx hash ──────────┤
  │       │          │          │           │
  │   <─ success ───┤          │           │
  │       │          │          │           │
  │   ✅ Executed!              │           │
```

---

## 🎯 Summary

### Registration (One-Time)
1. Tap chip → Get address
2. Tap chip → Sign EIP-712 registration
3. Submit transaction → Store ownership on-chain

### Configuration (One-Time Per Action)
1. Select chip and action type
2. Fill in details (token, recipient, amount)
3. Build callData
4. Submit transaction → Store configuration on-chain

### Execution (Every Time - Gasless!)
1. Tap chip → Get address
2. Verify ownership → Check registry
3. Fetch configuration → Get action details
4. Tap chip → Sign EIP-712 authorization
5. Send to relay → Backend executes
6. Protocol validates → Security checks
7. Execute action → Call target contract
8. Success! → Transaction confirmed

**Key Innovation**: Physical tap replaces entire Web3 UX flow. No wallet popups, no gas approvals, no confirmations. Just tap and execute!

---

## 📚 File Reference

### Frontend
- Registration: `packages/nextjs/app/register/page.tsx`
- Configuration: `packages/nextjs/app/configure/page.tsx`
- Execution: `packages/nextjs/app/execute/page.tsx`
- NFC Hook: `packages/nextjs/hooks/useHaloChip.ts`
- Relay Hook: `packages/nextjs/hooks/useGaslessRelay.ts`

### Backend
- Relay API: `packages/nextjs/app/api/relay-execute-tap/route.ts`

### Smart Contracts
- Registry: `packages/foundry/contracts/core/TapThatXRegistry.sol`
- Protocol: `packages/foundry/contracts/core/TapThatXProtocol.sol`
- Configuration: `packages/foundry/contracts/core/TapThatXConfiguration.sol`
- Executor: `packages/foundry/contracts/core/TapThatXExecutor.sol`
- Auth Library: `packages/foundry/contracts/core/TapThatXAuth.sol`

---

This document covers every step of the TapThatX workflow. If you have questions about any specific part, let me know!




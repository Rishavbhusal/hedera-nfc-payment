/**
 * Hedera Utilities
 * 
 * Since Hedera Smart Contract Service is EVM-compatible,
 * we can use standard EVM addresses (0x...) for contracts.
 * 
 * However, Hedera also uses Account IDs (0.0.123456) for accounts.
 * This utility provides conversion helpers if needed.
 */

/**
 * Hedera Network Chain IDs
 */
export const HEDERA_CHAIN_IDS = {
  TESTNET: 296,
  MAINNET: 295,
} as const;

/**
 * Check if a chain ID is a Hedera network
 */
export function isHederaNetwork(chainId: number): boolean {
  return chainId === HEDERA_CHAIN_IDS.TESTNET || chainId === HEDERA_CHAIN_IDS.MAINNET;
}

/**
 * Get Hedera RPC URL for a chain ID
 */
export function getHederaRpcUrl(chainId: number): string | null {
  switch (chainId) {
    case HEDERA_CHAIN_IDS.TESTNET:
      return "https://testnet.hashio.io/api";
    case HEDERA_CHAIN_IDS.MAINNET:
      return "https://mainnet.hashio.io/api";
    default:
      return null;
  }
}

/**
 * Get Hedera explorer URL for a chain ID
 */
export function getHederaExplorerUrl(chainId: number): string | null {
  switch (chainId) {
    case HEDERA_CHAIN_IDS.TESTNET:
      return "https://hashscan.io/testnet";
    case HEDERA_CHAIN_IDS.MAINNET:
      return "https://hashscan.io";
    default:
      return null;
  }
}

/**
 * Convert Hedera Account ID (0.0.123456) to EVM address (0x...)
 * 
 * Note: This is a simplified conversion. In practice, Hedera accounts
 * have both an Account ID and an EVM address. The EVM address is
 * derived from the account's public key.
 * 
 * For most use cases with EVM-compatible contracts, you can use
 * the EVM address directly without conversion.
 */
export function accountIdToEvmAddress(accountId: string): string {
  // Hedera Account IDs are in format: 0.0.123456
  // For EVM compatibility, Hedera provides an EVM address
  // This is a placeholder - actual conversion requires Hedera SDK
  // In practice, wallets provide the EVM address directly
  
  // If already an EVM address, return as-is
  if (accountId.startsWith("0x")) {
    return accountId;
  }
  
  // For now, return a placeholder
  // In production, use @hashgraph/sdk to convert:
  // const accountIdObj = AccountId.fromString(accountId);
  // return accountIdObj.toEvmAddress();
  
  throw new Error(
    "Account ID to EVM address conversion requires Hedera SDK. " +
    "Use the EVM address directly from your wallet."
  );
}

/**
 * Get network name for Hedera chain ID
 */
export function getHederaNetworkName(chainId: number): string {
  switch (chainId) {
    case HEDERA_CHAIN_IDS.TESTNET:
      return "Hedera Testnet";
    case HEDERA_CHAIN_IDS.MAINNET:
      return "Hedera Mainnet";
    default:
      return "Unknown";
  }
}



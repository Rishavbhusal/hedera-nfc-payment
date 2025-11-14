import { defineChain } from "viem";

/**
 * Hedera Testnet - EVM Compatible
 * Chain ID: 296
 * RPC: https://testnet.hashio.io/api
 */
export const hederaTestnet = defineChain({
  id: 296,
  name: "Hedera Testnet",
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 8,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.hashio.io/api"],
    },
    public: {
      http: ["https://testnet.hashio.io/api"],
    },
  },
  blockExplorers: {
    default: {
      name: "HashScan",
      url: "https://hashscan.io/testnet",
    },
  },
  testnet: true,
});

/**
 * Hedera Mainnet - EVM Compatible
 * Chain ID: 295
 * RPC: https://mainnet.hashio.io/api
 */
export const hederaMainnet = defineChain({
  id: 295,
  name: "Hedera Mainnet",
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 8,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.hashio.io/api"],
    },
    public: {
      http: ["https://mainnet.hashio.io/api"],
    },
  },
  blockExplorers: {
    default: {
      name: "HashScan",
      url: "https://hashscan.io",
    },
  },
  testnet: false,
});



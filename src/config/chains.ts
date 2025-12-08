// ============================================
// AVALANCHE CHAIN CONFIGURATION
// ============================================

// Chain configuration types
export interface ChainConfig {
  chainId: number;
  networkString: string;
  usdc: string;
  explorer: string;
  rpc: string;
  name: string;
}

// Avalanche C-Chain Mainnet
export const avalancheMainnet: ChainConfig = {
  chainId: 43114,
  name: "Avalanche C-Chain",
  networkString: "avalanche",
  usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  explorer: "https://snowtrace.io",
  rpc: "https://api.avax.network/ext/bc/C/rpc",
};

// Avalanche Fuji Testnet
export const avalancheFuji: ChainConfig = {
  chainId: 43113,
  name: "Avalanche Fuji Testnet",
  networkString: "avalanche-fuji",
  usdc: "0x5425890298aed601595a70AB815c96711a31Bc65",
  explorer: "https://testnet.snowtrace.io",
  rpc: "https://api.avax-test.network/ext/bc/C/rpc",
};

// Chain configuration map
export const CHAIN_CONFIG: Record<string, ChainConfig> = {
  mainnet: avalancheMainnet,
  fuji: avalancheFuji,
};

export type NetworkType = keyof typeof CHAIN_CONFIG;

// Get current chain config based on environment
export function getChainConfig(): ChainConfig {
  const chainId = parseInt(process.env.CHAIN_ID || "43113");
  const network = chainId === 43114 ? "mainnet" : "fuji";
  return CHAIN_CONFIG[network];
}

// USDC decimals (always 6 for USDC)
export const USDC_DECIMALS = 6;

// Convert USD amount to USDC atomic units
export function usdToAtomicUnits(usdAmount: number): bigint {
  return BigInt(Math.round(usdAmount * 10 ** USDC_DECIMALS));
}

// Convert USDC atomic units to USD amount
export function atomicUnitsToUsd(atomicUnits: bigint): number {
  return Number(atomicUnits) / 10 ** USDC_DECIMALS;
}

// Format amount for display
export function formatUsdAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

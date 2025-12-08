// ============================================
// THIRDWEB x402 FACILITATOR CONFIGURATION
// ============================================

import { createThirdwebClient } from "thirdweb";
import { getChainConfig, type ChainConfig } from "./chains.js";

// Lazy initialization to avoid issues during import
let _client: ReturnType<typeof createThirdwebClient> | null = null;
let _facilitatorInstance: ThirdwebFacilitator | null = null;

// Create Thirdweb client
export function getThirdwebClient(): ReturnType<typeof createThirdwebClient> {
  if (!_client) {
    const secretKey = process.env.THIRDWEB_SECRET_KEY;

    if (!secretKey) {
      throw new Error("THIRDWEB_SECRET_KEY is required");
    }

    _client = createThirdwebClient({
      secretKey,
    });
  }

  return _client;
}

// Facilitator configuration interface
interface FacilitatorConfig {
  client: ReturnType<typeof createThirdwebClient>;
  serverWalletAddress: string;
  waitUntil?: "simulated" | "submitted" | "confirmed";
}

// Thirdweb Facilitator class wrapper
export class ThirdwebFacilitator {
  private config: FacilitatorConfig;
  private chainConfig: ChainConfig;

  constructor(config: FacilitatorConfig) {
    this.config = config;
    this.chainConfig = getChainConfig();
  }

  // Get supported payment methods
  async supported(options?: {
    chainId?: number;
    tokenAddress?: string;
  }): Promise<{
    schemes: string[];
    networks: string[];
    tokens: Array<{
      address: string;
      symbol: string;
      decimals: number;
      chainId: number;
    }>;
  }> {
    const chainId = options?.chainId || this.chainConfig.chainId;

    return {
      schemes: ["exact"],
      networks: [this.chainConfig.networkString],
      tokens: [
        {
          address: this.chainConfig.usdc,
          symbol: "USDC",
          decimals: 6,
          chainId,
        },
      ],
    };
  }

  // Verify payment payload
  async verify(
    paymentPayload: string,
    _paymentRequirements: object
  ): Promise<{
    isValid: boolean;
    invalidReason?: string;
  }> {
    try {
      const payload = JSON.parse(
        Buffer.from(paymentPayload, "base64").toString()
      );

      if (!payload.x402Version || !payload.scheme || !payload.network) {
        return {
          isValid: false,
          invalidReason: "Invalid payment payload structure",
        };
      }

      if (payload.scheme !== "exact") {
        return {
          isValid: false,
          invalidReason: "Unsupported payment scheme",
        };
      }

      if (payload.network !== this.chainConfig.networkString) {
        return {
          isValid: false,
          invalidReason: "Network mismatch",
        };
      }

      if (!payload.payload?.signature) {
        return {
          isValid: false,
          invalidReason: "Missing payment signature",
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        invalidReason:
          error instanceof Error ? error.message : "Verification failed",
      };
    }
  }

  // Settle payment on-chain
  async settle(
    paymentPayload: string,
    _paymentRequirements: object
  ): Promise<{
    success: boolean;
    txHash?: string;
    networkId?: string;
    error?: string;
  }> {
    try {
      // Parse to validate structure
      JSON.parse(Buffer.from(paymentPayload, "base64").toString());

      // For hackathon demo, simulate successful settlement
      const mockTxHash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("")}`;

      return {
        success: true,
        txHash: mockTxHash,
        networkId: this.chainConfig.networkString,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Settlement failed",
      };
    }
  }

  // Get chain configuration
  getChainConfig(): ChainConfig {
    return this.chainConfig;
  }

  // Get server wallet address
  getServerWalletAddress(): string {
    return this.config.serverWalletAddress;
  }
}

// Get or create facilitator instance
export function getFacilitator(): ThirdwebFacilitator {
  if (!_facilitatorInstance) {
    const serverWalletAddress = process.env.SERVER_WALLET_ADDRESS;

    if (!serverWalletAddress) {
      throw new Error("SERVER_WALLET_ADDRESS is required");
    }

    _facilitatorInstance = new ThirdwebFacilitator({
      client: getThirdwebClient(),
      serverWalletAddress,
      waitUntil: "confirmed",
    });
  }

  return _facilitatorInstance;
}

// Create payment requirements for a session
export function createPaymentRequirements(
  sessionId: string,
  amount: number,
  merchantAddress: string,
  description: string = "Tink Protocol Tip Payment"
): object {
  const chainConfig = getChainConfig();

  return {
    x402Version: 1,
    scheme: "exact",
    network: chainConfig.networkString,
    maxAmountRequired: (amount * 1e6).toString(),
    resource: `/api/payments/settle/${sessionId}`,
    description,
    mimeType: "application/json",
    payTo: merchantAddress,
    maxTimeoutSeconds: 300,
    asset: chainConfig.usdc,
    extra: {
      name: "USD Coin",
      version: "2",
      chainId: chainConfig.chainId,
    },
  };
}

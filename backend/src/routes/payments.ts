// ============================================
// PAYMENT ROUTES - x402 Payment Flow
// ============================================

import { Router } from "express";
import {
  preparePayment,
  verifyPayment,
  settlePayment,
  getPaymentStatus,
  generatePaymentUrl,
  getExplorerUrl,
} from "../services/payment.js";
import { getChainConfig } from "../config/chains.js";
import { getFacilitator } from "../config/thirdweb.js";
import type {
  ApiResponse,
  PreparePaymentResponse,
  VerifyPaymentResponse,
  SettlePaymentResponse,
} from "../types/index.js";

const router = Router();

// ============================================
// POST /api/payments/prepare - Prepare payment for a session
// ============================================
router.post("/prepare", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "sessionId is required",
      } as ApiResponse<null>);
    }

    const result = await preparePayment(sessionId);

    return res.json({
      success: true,
      data: result,
    } as ApiResponse<PreparePaymentResponse>);
  } catch (error) {
    console.error("Error preparing payment:", error);
    return res.status(400).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to prepare payment",
    } as ApiResponse<null>);
  }
});

// ============================================
// POST /api/payments/verify - Verify payment payload
// ============================================
router.post("/verify", async (req, res) => {
  try {
    const { sessionId, paymentPayload } = req.body;

    if (!sessionId || !paymentPayload) {
      return res.status(400).json({
        success: false,
        error: "sessionId and paymentPayload are required",
      } as ApiResponse<null>);
    }

    const result = await verifyPayment(sessionId, paymentPayload);

    return res.json({
      success: true,
      data: result,
    } as ApiResponse<VerifyPaymentResponse>);
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to verify payment",
    } as ApiResponse<null>);
  }
});

// ============================================
// POST /api/payments/settle - Settle payment on-chain
// ============================================
router.post("/settle", async (req, res) => {
  try {
    const { sessionId, paymentPayload, payerAddress } = req.body;

    if (!sessionId || !paymentPayload || !payerAddress) {
      return res.status(400).json({
        success: false,
        error: "sessionId, paymentPayload, and payerAddress are required",
      } as ApiResponse<null>);
    }

    const result = await settlePayment(sessionId, paymentPayload, payerAddress);

    if (result.success) {
      return res.json({
        success: true,
        data: result,
        message: "Payment settled successfully",
      } as ApiResponse<SettlePaymentResponse>);
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || "Settlement failed",
      } as ApiResponse<null>);
    }
  } catch (error) {
    console.error("Error settling payment:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to settle payment",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/payments/status/:sessionId - Get payment status
// ============================================
router.get("/status/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = getPaymentStatus(sessionId);

    if (!result.session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      } as ApiResponse<null>);
    }

    return res.json({
      success: true,
      data: {
        session: result.session,
        transaction: result.transaction,
        explorerUrl: result.transaction
          ? getExplorerUrl(result.transaction.txHash)
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch payment status",
    } as ApiResponse<null>);
  }
});

// ============================================
// POST /api/payments/url - Generate payment URL
// ============================================
router.post("/url", (req, res) => {
  try {
    const { sessionId } = req.body;
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "sessionId is required",
      } as ApiResponse<null>);
    }

    const paymentUrl = generatePaymentUrl(sessionId, baseUrl);

    return res.json({
      success: true,
      data: { paymentUrl },
    });
  } catch (error) {
    console.error("Error generating payment URL:", error);
    return res.status(400).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate payment URL",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/payments/supported - Get supported payment methods
// ============================================
router.get("/supported", async (_req, res) => {
  try {
    const facilitator = getFacilitator();
    const supported = await facilitator.supported();
    const chainConfig = getChainConfig();

    return res.json({
      success: true,
      data: {
        ...supported,
        chainId: chainConfig.chainId,
        network: chainConfig.networkString,
        explorer: chainConfig.explorer,
      },
    });
  } catch (error) {
    console.error("Error fetching supported methods:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch supported payment methods",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/payments/config - Get payment configuration
// ============================================
router.get("/config", (_req, res) => {
  try {
    const chainConfig = getChainConfig();

    return res.json({
      success: true,
      data: {
        chainId: chainConfig.chainId,
        network: chainConfig.networkString,
        usdcAddress: chainConfig.usdc,
        explorer: chainConfig.explorer,
        currency: "USDC",
        decimals: 6,
      },
    });
  } catch (error) {
    console.error("Error fetching payment config:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch payment configuration",
    } as ApiResponse<null>);
  }
});

export default router;

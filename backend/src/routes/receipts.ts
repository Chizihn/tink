// ============================================
// RECEIPT ROUTES
// ============================================

import { Router } from "express";
import { SessionRepo, TransactionRepo, MerchantRepo } from "../db/models.js";
import { getExplorerUrl } from "../services/payment.js";
import { getChainConfig } from "../config/chains.js";
import type { ApiResponse } from "../types/index.js";

const router = Router();

// Receipt response type
interface ReceiptData {
  session: {
    id: string;
    memo: string;
    billAmount: number;
    tipAmount: number;
    totalAmount: number;
    currency: string;
    status: string;
    createdAt: string;
  };
  merchant: {
    id: string;
    name: string;
    slug: string;
    walletAddress: string;
  };
  transaction: {
    id: string;
    txHash: string;
    networkId: string;
    status: string;
    confirmedAt: string | null;
    explorerUrl: string;
  } | null;
  network: {
    name: string;
    chainId: number;
    currency: string;
  };
  payer: {
    address: string | null;
  };
}

// ============================================
// GET /api/receipts/:sessionId - Get receipt for a session
// ============================================
router.get("/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;

    // Find session
    const session = SessionRepo.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      } as ApiResponse<null>);
    }

    // Find merchant
    const merchant = MerchantRepo.findById(session.merchantId);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: "Merchant not found",
      } as ApiResponse<null>);
    }

    // Find transaction
    const transaction = TransactionRepo.findBySessionId(sessionId);

    // Get chain config
    const chainConfig = getChainConfig();

    // Build receipt response
    const receipt: ReceiptData = {
      session: {
        id: session.id,
        memo: session.memo,
        billAmount: session.billAmount,
        tipAmount: session.tipAmount || 0,
        totalAmount: session.totalAmount || session.billAmount,
        currency: session.currency,
        status: session.status,
        createdAt: session.createdAt,
      },
      merchant: {
        id: merchant.id,
        name: merchant.name,
        slug: merchant.slug,
        walletAddress: merchant.walletAddress,
      },
      transaction: transaction
        ? {
            id: transaction.id,
            txHash: transaction.txHash,
            networkId: transaction.networkId,
            status: transaction.status,
            confirmedAt: transaction.confirmedAt || null,
            explorerUrl: getExplorerUrl(transaction.txHash),
          }
        : null,
      network: {
        name: chainConfig.networkString,
        chainId: chainConfig.chainId,
        currency: "USDC",
      },
      payer: {
        address: session.payerAddress || null,
      },
    };

    return res.json({
      success: true,
      data: receipt,
    } as ApiResponse<ReceiptData>);
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch receipt",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/receipts/:sessionId/share - Get shareable receipt URL
// ============================================
router.get("/:sessionId/share", (req, res) => {
  try {
    const { sessionId } = req.params;
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const session = SessionRepo.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      } as ApiResponse<null>);
    }

    const shareUrl = `${baseUrl}/receipt?session=${sessionId}`;

    return res.json({
      success: true,
      data: {
        shareUrl,
        sessionId,
      },
    });
  } catch (error) {
    console.error("Error generating share URL:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to generate share URL",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/receipts/:sessionId/download - Download receipt as JSON
// ============================================
router.get("/:sessionId/download", (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = SessionRepo.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      } as ApiResponse<null>);
    }

    const merchant = MerchantRepo.findById(session.merchantId);
    const transaction = TransactionRepo.findBySessionId(sessionId);
    const chainConfig = getChainConfig();

    const receiptData = {
      receiptId: session.memo,
      date: session.createdAt,
      merchant: merchant?.name || "Unknown",
      billAmount: session.billAmount,
      tipAmount: session.tipAmount || 0,
      totalAmount: session.totalAmount || session.billAmount,
      currency: session.currency,
      network: chainConfig.networkString,
      transactionHash: transaction?.txHash || null,
      status: session.status,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="receipt-${session.memo}.json"`
    );

    return res.send(JSON.stringify(receiptData, null, 2));
  } catch (error) {
    console.error("Error downloading receipt:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to download receipt",
    } as ApiResponse<null>);
  }
});

export default router;

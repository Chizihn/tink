// ============================================
// TIP ROUTES - Calculations & AI Suggestions
// ============================================

import { Router } from "express";
import { getAISuggestion, calculateTipOptions } from "../services/ai.js";
import { getMerchantTipSplit } from "../services/tipSplit.js";

import type {
  ApiResponse,
  AISuggestion,
  TipCalculation,
} from "../types/index.js";

const router = Router();

// ============================================
// POST /api/tips/calculate - Calculate tip options for a bill
// ============================================
router.post("/calculate", (req, res) => {
  try {
    const { billAmount } = req.body;

    if (!billAmount || billAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid billAmount is required",
      } as ApiResponse<null>);
    }

    const result = calculateTipOptions(billAmount);

    return res.json({
      success: true,
      data: {
        billAmount,
        options: result.options,
        roundUp: result.roundUp,
      },
    } as ApiResponse<TipCalculation>);
  } catch (error) {
    console.error("Error calculating tips:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to calculate tips",
    } as ApiResponse<null>);
  }
});

// ============================================
// POST /api/tips/ai-suggestion - Get AI-powered tip suggestion
// ============================================
router.post("/ai-suggestion", async (req, res) => {
  try {
    const { billAmount, merchantId, context } = req.body;

    if (!billAmount || billAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid billAmount is required",
      } as ApiResponse<null>);
    }

    const suggestion = await getAISuggestion({
      billAmount,
      merchantId,
      context,
    });

    return res.json({
      success: true,
      data: suggestion,
    } as ApiResponse<AISuggestion>);
  } catch (error) {
    console.error("Error getting AI suggestion:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get AI suggestion",
    } as ApiResponse<null>);
  }
});

// ============================================
// POST /api/tips/split - Calculate tip split for a merchant
// ============================================
router.post("/split", (req, res) => {
  try {
    const { merchantId, tipAmount } = req.body;

    if (!merchantId) {
      return res.status(400).json({
        success: false,
        error: "merchantId is required",
      } as ApiResponse<null>);
    }

    if (!tipAmount || tipAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid tipAmount is required",
      } as ApiResponse<null>);
    }

    const result = getMerchantTipSplit(merchantId, tipAmount);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Merchant not found",
      } as ApiResponse<null>);
    }

    return res.json({
      success: true,
      data: {
        tipAmount,
        splits: result.splits,
        total: result.total,
      },
    } as ApiResponse<{
      tipAmount: number;
      splits: Array<{ name: string; percentage: number; amount: number }>;
      total: number;
    }>);
  } catch (error) {
    console.error("Error calculating tip split:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to calculate tip split",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/tips/percentages - Get available tip percentages
// ============================================
router.get("/percentages", (_req, res) => {
  const percentages = [
    { value: 10, label: "10%" },
    { value: 15, label: "15%" },
    { value: 18, label: "18%" },
    { value: 20, label: "20%" },
    { value: 25, label: "25%" },
  ];

  return res.json({
    success: true,
    data: percentages,
  });
});

export default router;

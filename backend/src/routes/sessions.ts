// ============================================
// SESSION ROUTES
// ============================================

import { Router } from "express";
import { SessionRepo, MerchantRepo } from "../db/models.js";
import type { ApiResponse, CreateSessionResponse } from "../types/index.js";

const router = Router();

// ============================================
// POST /api/sessions - Create a new tip session
// ============================================
router.post("/", (req, res) => {
  try {
    const { merchantId, billAmount, currency } = req.body;

    if (!merchantId || billAmount === undefined) {
      return res.status(400).json({
        success: false,
        error: "merchantId and billAmount are required",
      } as ApiResponse<null>);
    }

    if (billAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "billAmount must be greater than 0",
      } as ApiResponse<null>);
    }

    // Find merchant by ID or slug
    let merchant = MerchantRepo.findById(merchantId);
    if (!merchant) {
      merchant = MerchantRepo.findBySlug(merchantId);
    }

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: "Merchant not found",
      } as ApiResponse<null>);
    }

    const session = SessionRepo.create({
      merchantId: merchant.id,
      billAmount,
      currency: currency || "USDC",
    });

    return res.status(201).json({
      success: true,
      data: {
        session,
        merchant,
      },
    } as ApiResponse<CreateSessionResponse>);
  } catch (error) {
    console.error("Error creating session:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create session",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/sessions/:id - Get session by ID
// ============================================
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;

    const session = SessionRepo.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      } as ApiResponse<null>);
    }

    // Check if expired
    if (
      new Date(session.expiresAt) < new Date() &&
      session.status === "pending"
    ) {
      SessionRepo.updateStatus(id, "expired");
      session.status = "expired";
    }

    const merchant = MerchantRepo.findById(session.merchantId);

    return res.json({
      success: true,
      data: {
        session,
        merchant,
      },
    } as ApiResponse<CreateSessionResponse>);
  } catch (error) {
    console.error("Error fetching session:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch session",
    } as ApiResponse<null>);
  }
});

// ============================================
// PATCH /api/sessions/:id/tip - Update tip selection
// ============================================
router.patch("/:id/tip", (req, res) => {
  try {
    const { id } = req.params;
    const { tipAmount, tipPercentage } = req.body;

    const session = SessionRepo.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      } as ApiResponse<null>);
    }

    if (session.status === "expired") {
      return res.status(400).json({
        success: false,
        error: "Session has expired",
      } as ApiResponse<null>);
    }

    if (session.status === "confirmed") {
      return res.status(400).json({
        success: false,
        error: "Payment already completed",
      } as ApiResponse<null>);
    }

    // Calculate tip amount if percentage provided
    let finalTipAmount = tipAmount;
    let finalTipPercentage = tipPercentage;

    if (tipPercentage !== undefined && tipAmount === undefined) {
      finalTipAmount =
        Math.round(session.billAmount * (tipPercentage / 100) * 100) / 100;
    } else if (tipAmount !== undefined && tipPercentage === undefined) {
      finalTipPercentage =
        Math.round((tipAmount / session.billAmount) * 100 * 10) / 10;
    }

    if (finalTipAmount === undefined || finalTipAmount < 0) {
      return res.status(400).json({
        success: false,
        error: "Valid tipAmount or tipPercentage is required",
      } as ApiResponse<null>);
    }

    const updatedSession = SessionRepo.updateTip(
      id,
      finalTipAmount,
      finalTipPercentage || 0
    );
    const merchant = MerchantRepo.findById(updatedSession.merchantId);

    return res.json({
      success: true,
      data: {
        session: updatedSession,
        merchant,
      },
      message: "Tip updated successfully",
    } as ApiResponse<CreateSessionResponse>);
  } catch (error) {
    console.error("Error updating tip:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update tip",
    } as ApiResponse<null>);
  }
});

// ============================================
// POST /api/sessions/:id/cancel - Cancel a session
// ============================================
router.post("/:id/cancel", (req, res) => {
  try {
    const { id } = req.params;

    const session = SessionRepo.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      } as ApiResponse<null>);
    }

    if (session.status === "confirmed") {
      return res.status(400).json({
        success: false,
        error: "Cannot cancel completed payment",
      } as ApiResponse<null>);
    }

    SessionRepo.updateStatus(id, "expired");

    return res.json({
      success: true,
      message: "Session cancelled successfully",
    } as ApiResponse<null>);
  } catch (error) {
    console.error("Error cancelling session:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to cancel session",
    } as ApiResponse<null>);
  }
});

export default router;

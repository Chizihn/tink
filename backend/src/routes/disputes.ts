// ============================================
// DISPUTE ROUTES
// ============================================

import { Router } from "express";
import { DisputeRepo, SessionRepo, MerchantRepo } from "../db/models.js";
import type {
  ApiResponse,
  Dispute,
  CreateDisputeRequest,
  DisputeReason,
} from "../types/index.js";

const router = Router();

// Valid dispute reasons
const VALID_REASONS: DisputeReason[] = [
  "incorrect_amount",
  "unauthorized_transaction",
  "service_not_received",
  "duplicate_charge",
  "other",
];

// ============================================
// POST /api/disputes - Create a new dispute
// ============================================
router.post("/", (req, res) => {
  try {
    const { sessionId, reason, details, submittedBy } =
      req.body as CreateDisputeRequest;

    // Validate required fields
    if (!sessionId || !reason || !details || !submittedBy) {
      return res.status(400).json({
        success: false,
        error: "sessionId, reason, details, and submittedBy are required",
      } as ApiResponse<null>);
    }

    // Validate reason
    if (!VALID_REASONS.includes(reason)) {
      return res.status(400).json({
        success: false,
        error: `Invalid reason. Must be one of: ${VALID_REASONS.join(", ")}`,
      } as ApiResponse<null>);
    }

    // Find session
    const session = SessionRepo.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      } as ApiResponse<null>);
    }

    // Create dispute
    const dispute = DisputeRepo.create({
      sessionId,
      merchantId: session.merchantId,
      reason,
      details,
      submittedBy,
    });

    return res.status(201).json({
      success: true,
      data: dispute,
      message: "Dispute submitted successfully",
    } as ApiResponse<Dispute>);
  } catch (error) {
    console.error("Error creating dispute:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create dispute",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/disputes/:id - Get dispute by ID
// ============================================
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;

    const dispute = DisputeRepo.findById(id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        error: "Dispute not found",
      } as ApiResponse<null>);
    }

    return res.json({
      success: true,
      data: dispute,
    } as ApiResponse<Dispute>);
  } catch (error) {
    console.error("Error fetching dispute:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch dispute",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/disputes/merchant/:merchantId - Get disputes for a merchant
// ============================================
router.get("/merchant/:merchantId", (req, res) => {
  try {
    const { merchantId } = req.params;

    // Find merchant
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

    const disputes = DisputeRepo.getByMerchant(merchant.id);

    return res.json({
      success: true,
      data: disputes,
    } as ApiResponse<Dispute[]>);
  } catch (error) {
    console.error("Error fetching disputes:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch disputes",
    } as ApiResponse<null>);
  }
});

// ============================================
// PATCH /api/disputes/:id/status - Update dispute status
// ============================================
router.patch("/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "status is required",
      } as ApiResponse<null>);
    }

    const validStatuses = ["pending", "under_review", "resolved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      } as ApiResponse<null>);
    }

    const dispute = DisputeRepo.findById(id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        error: "Dispute not found",
      } as ApiResponse<null>);
    }

    const updatedDispute = DisputeRepo.updateStatus(id, status, resolution);

    return res.json({
      success: true,
      data: updatedDispute,
      message: "Dispute status updated successfully",
    } as ApiResponse<Dispute>);
  } catch (error) {
    console.error("Error updating dispute:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update dispute",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/disputes/reasons - Get valid dispute reasons
// ============================================
router.get("/meta/reasons", (_req, res) => {
  const reasons = [
    { value: "incorrect_amount", label: "Incorrect Amount" },
    { value: "unauthorized_transaction", label: "Unauthorized Transaction" },
    { value: "service_not_received", label: "Service Not Received" },
    { value: "duplicate_charge", label: "Duplicate Charge" },
    { value: "other", label: "Other" },
  ];

  return res.json({
    success: true,
    data: reasons,
  });
});

export default router;

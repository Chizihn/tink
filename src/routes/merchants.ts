// ============================================
// MERCHANT ROUTES
// ============================================

import { Router } from "express";
import { MerchantRepo, TipSplitRepo, TransactionRepo } from "../db/models.js";
import type {
  ApiResponse,
  Merchant,
  MerchantStats,
  TipSplitConfig,
  RecentTip,
} from "../types/index.js";

const router = Router();

// ============================================
// GET /api/merchants/:id - Get merchant by ID or slug
// ============================================
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;

    // Try finding by ID first, then by slug
    let merchant = MerchantRepo.findById(id);

    if (!merchant) {
      merchant = MerchantRepo.findBySlug(id);
    }

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: "Merchant not found",
      } as ApiResponse<null>);
    }

    return res.json({
      success: true,
      data: merchant,
    } as ApiResponse<Merchant>);
  } catch (error) {
    console.error("Error fetching merchant:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch merchant",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/merchants/:id/stats - Get merchant dashboard stats
// ============================================
router.get("/:id/stats", (req, res) => {
  try {
    const { id } = req.params;

    let merchant = MerchantRepo.findById(id);
    if (!merchant) {
      merchant = MerchantRepo.findBySlug(id);
    }

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: "Merchant not found",
      } as ApiResponse<null>);
    }

    const stats = MerchantRepo.getStats(merchant.id);

    return res.json({
      success: true,
      data: stats,
    } as ApiResponse<MerchantStats>);
  } catch (error) {
    console.error("Error fetching merchant stats:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch stats",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/merchants/:id/tips - Get recent tips
// ============================================
router.get("/:id/tips", (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    let merchant = MerchantRepo.findById(id);
    if (!merchant) {
      merchant = MerchantRepo.findBySlug(id);
    }

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: "Merchant not found",
      } as ApiResponse<null>);
    }

    const tips = TransactionRepo.getRecentByMerchant(merchant.id, limit);

    return res.json({
      success: true,
      data: tips,
    } as ApiResponse<RecentTip[]>);
  } catch (error) {
    console.error("Error fetching tips:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch tips",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/merchants/:id/tips/export - Export tips as CSV
// ============================================
router.get("/:id/tips/export", (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let merchant = MerchantRepo.findById(id);
    if (!merchant) {
      merchant = MerchantRepo.findBySlug(id);
    }

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: "Merchant not found",
      } as ApiResponse<null>);
    }

    const transactions = TransactionRepo.getForExport(
      merchant.id,
      startDate as string | undefined,
      endDate as string | undefined
    );

    // Generate CSV
    const headers = [
      "Date",
      "Bill Amount",
      "Tip Amount",
      "Total",
      "Tx Hash",
      "Status",
    ];
    const rows = transactions.map((tx) => [
      tx.createdAt,
      tx.billAmount.toFixed(2),
      tx.tipAmount.toFixed(2),
      tx.totalAmount.toFixed(2),
      tx.txHash,
      tx.status,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="tips-${merchant.slug}-${
        new Date().toISOString().split("T")[0]
      }.csv"`
    );

    return res.send(csv);
  } catch (error) {
    console.error("Error exporting tips:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to export tips",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/merchants/:id/split-config - Get tip split configuration
// ============================================
router.get("/:id/split-config", (req, res) => {
  try {
    const { id } = req.params;

    let merchant = MerchantRepo.findById(id);
    if (!merchant) {
      merchant = MerchantRepo.findBySlug(id);
    }

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: "Merchant not found",
      } as ApiResponse<null>);
    }

    const splitConfig = TipSplitRepo.getByMerchantId(merchant.id);

    return res.json({
      success: true,
      data: splitConfig,
    } as ApiResponse<TipSplitConfig>);
  } catch (error) {
    console.error("Error fetching split config:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch split configuration",
    } as ApiResponse<null>);
  }
});

// ============================================
// PUT /api/merchants/:id/split-config - Update tip split configuration
// ============================================
router.put("/:id/split-config", (req, res) => {
  try {
    const { id } = req.params;
    const { splits } = req.body;

    let merchant = MerchantRepo.findById(id);
    if (!merchant) {
      merchant = MerchantRepo.findBySlug(id);
    }

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: "Merchant not found",
      } as ApiResponse<null>);
    }

    // Validate splits sum to 100%
    const totalPercentage = splits.reduce(
      (sum: number, split: { percentage: number }) => sum + split.percentage,
      0
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
      return res.status(400).json({
        success: false,
        error: "Split percentages must sum to 100%",
      } as ApiResponse<null>);
    }

    const updatedConfig = TipSplitRepo.update(merchant.id, splits);

    return res.json({
      success: true,
      data: updatedConfig,
      message: "Split configuration updated successfully",
    } as ApiResponse<TipSplitConfig>);
  } catch (error) {
    console.error("Error updating split config:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update split configuration",
    } as ApiResponse<null>);
  }
});

// ============================================
// POST /api/merchants - Create a new merchant
// ============================================
router.post("/", (req, res) => {
  try {
    const { name, slug, walletAddress, avatar } = req.body;

    if (!name || !slug || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Name, slug, and walletAddress are required",
      } as ApiResponse<null>);
    }

    // Check if slug already exists
    const existing = MerchantRepo.findBySlug(slug);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Merchant with this slug already exists",
      } as ApiResponse<null>);
    }

    const merchant = MerchantRepo.create({
      name,
      slug,
      walletAddress,
      avatar,
    });

    // Create default tip splits
    TipSplitRepo.update(merchant.id, [
      { name: "Front Of House", percentage: 60 },
      { name: "Back Of House", percentage: 30 },
      { name: "Bar", percentage: 10 },
    ]);

    return res.status(201).json({
      success: true,
      data: merchant,
      message: "Merchant created successfully",
    } as ApiResponse<Merchant>);
  } catch (error) {
    console.error("Error creating merchant:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create merchant",
    } as ApiResponse<null>);
  }
});

export default router;

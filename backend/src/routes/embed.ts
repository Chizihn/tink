// ============================================
// EMBED/WIDGET ROUTES
// ============================================

import { Router } from "express";
import { MerchantRepo, SessionRepo } from "../db/models.js";
import { getChainConfig } from "../config/chains.js";
import type {
  ApiResponse,
  EmbedConfig,
  WidgetSession,
} from "../types/index.js";

const router = Router();

// ============================================
// GET /api/embed/config - Get embed configuration
// ============================================
router.get("/config", (req, res) => {
  try {
    const { merchant } = req.query;

    if (!merchant) {
      return res.status(400).json({
        success: false,
        error: "merchant parameter is required",
      } as ApiResponse<null>);
    }

    // Find merchant
    let merchantData = MerchantRepo.findById(merchant as string);
    if (!merchantData) {
      merchantData = MerchantRepo.findBySlug(merchant as string);
    }

    if (!merchantData) {
      return res.status(404).json({
        success: false,
        error: "Merchant not found",
      } as ApiResponse<null>);
    }

    const chainConfig = getChainConfig();

    return res.json({
      success: true,
      data: {
        merchant: {
          id: merchantData.id,
          name: merchantData.name,
          slug: merchantData.slug,
          avatar: merchantData.avatar,
        },
        network: {
          chainId: chainConfig.chainId,
          name: chainConfig.networkString,
          currency: "USDC",
          explorer: chainConfig.explorer,
        },
        features: {
          aiSuggestions: true,
          customTip: true,
          roundUp: true,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching embed config:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch embed configuration",
    } as ApiResponse<null>);
  }
});

// ============================================
// POST /api/embed/session - Create widget session
// ============================================
router.post("/session", (req, res) => {
  try {
    const { merchantId, billAmount, theme, customColor, aiSuggestions } =
      req.body as EmbedConfig & { billAmount?: number };

    if (!merchantId) {
      return res.status(400).json({
        success: false,
        error: "merchantId is required",
      } as ApiResponse<null>);
    }

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

    // Create session if bill amount provided
    let session = null;
    if (billAmount && billAmount > 0) {
      session = SessionRepo.create({
        merchantId: merchant.id,
        billAmount,
        currency: "USDC",
      });
    }

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const embedParams = new URLSearchParams({
      merchant: merchant.slug,
      ...(billAmount && { bill: billAmount.toString() }),
      ...(theme && { theme }),
      ...(customColor && { color: customColor }),
      ...(aiSuggestions !== undefined && { ai: aiSuggestions.toString() }),
      ...(session && { session: session.id }),
    });

    const embedUrl = `${baseUrl}/embed?${embedParams.toString()}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min

    return res.status(201).json({
      success: true,
      data: {
        embedUrl,
        sessionId: session?.id || null,
        expiresAt,
        merchant: {
          id: merchant.id,
          name: merchant.name,
          slug: merchant.slug,
        },
      },
    } as ApiResponse<WidgetSession & { merchant: object }>);
  } catch (error) {
    console.error("Error creating widget session:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create widget session",
    } as ApiResponse<null>);
  }
});

// ============================================
// GET /api/embed/merchants/:slug - Get merchant for embed
// ============================================
router.get("/merchants/:slug", (req, res) => {
  try {
    const { slug } = req.params;

    const merchant = MerchantRepo.findBySlug(slug);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: "Merchant not found",
      } as ApiResponse<null>);
    }

    // Return limited merchant info for embed
    return res.json({
      success: true,
      data: {
        id: merchant.id,
        name: merchant.name,
        slug: merchant.slug,
        avatar: merchant.avatar,
        walletAddress: merchant.walletAddress,
      },
    });
  } catch (error) {
    console.error("Error fetching merchant for embed:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch merchant",
    } as ApiResponse<null>);
  }
});

export default router;

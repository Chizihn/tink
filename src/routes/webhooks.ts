// ============================================
// WEBHOOK ROUTES
// ============================================

import { Router } from "express";
import crypto from "crypto";
import { SessionRepo, TransactionRepo } from "../db/models.js";
import type { ApiResponse, WebhookPayload } from "../types/index.js";

const router = Router();

// ============================================
// Webhook signature verification
// ============================================
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// ============================================
// POST /api/webhooks/payment - Payment confirmation webhook
// ============================================
router.post("/payment", (req, res) => {
  try {
    const signature = req.headers["x-tink-signature"] as string;
    const webhookSecret = process.env.WEBHOOK_SECRET;

    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(
        JSON.stringify(req.body),
        signature,
        webhookSecret
      );

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: "Invalid webhook signature",
        } as ApiResponse<null>);
      }
    }

    const { event, data } = req.body as WebhookPayload;

    console.log(`📥 Webhook received: ${event}`, data);

    switch (event) {
      case "payment.confirmed": {
        const { sessionId, payerAddress } = data;

        // Update session status
        const session = SessionRepo.findById(sessionId);
        if (session && session.status !== "confirmed") {
          SessionRepo.updateStatus(sessionId, "confirmed", payerAddress);

          // Confirm transaction
          const transaction = TransactionRepo.findBySessionId(sessionId);
          if (transaction) {
            TransactionRepo.confirm(transaction.id);
          }
        }
        break;
      }

      case "payment.failed": {
        const { sessionId } = data;

        const session = SessionRepo.findById(sessionId);
        if (session && session.status !== "confirmed") {
          SessionRepo.updateStatus(sessionId, "failed");
        }
        break;
      }

      default:
        console.log(`Unknown webhook event: ${event}`);
    }

    return res.json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process webhook",
    } as ApiResponse<null>);
  }
});

// ============================================
// POST /api/webhooks/test - Test webhook endpoint
// ============================================
router.post("/test", (req, res) => {
  console.log("🧪 Test webhook received:", req.body);

  return res.json({
    success: true,
    message: "Test webhook received",
    received: req.body,
  });
});

// ============================================
// Utility: Generate webhook signature
// ============================================
export function generateWebhookSignature(
  payload: object,
  secret: string
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
}

// ============================================
// Utility: Send webhook to merchant
// ============================================
export async function sendWebhook(
  url: string,
  event: string,
  data: object,
  secret?: string
): Promise<boolean> {
  try {
    const payload = { event, data, timestamp: new Date().toISOString() };
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (secret) {
      headers["x-tink-signature"] = generateWebhookSignature(payload, secret);
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to send webhook:", error);
    return false;
  }
}

export default router;

// ============================================
// PAYMENT SERVICE - x402 + THIRDWEB INTEGRATION
// ============================================

import {
  getFacilitator,
  createPaymentRequirements,
} from "../config/thirdweb.js";
import { getChainConfig } from "../config/chains.js";
import { SessionRepo, TransactionRepo, MerchantRepo } from "../db/models.js";
import type {
  PaymentRequirements,
  PreparePaymentResponse,
  VerifyPaymentResponse,
  SettlePaymentResponse,
  TipSession,
} from "../types/index.js";

// ============================================
// PREPARE PAYMENT
// ============================================

export async function preparePayment(
  sessionId: string
): Promise<PreparePaymentResponse> {
  const session = SessionRepo.findById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.status === "expired") {
    throw new Error("Session has expired");
  }

  if (session.status === "confirmed") {
    throw new Error("Payment already completed");
  }

  if (!session.totalAmount) {
    throw new Error("Tip not selected yet");
  }

  const merchant = MerchantRepo.findById(session.merchantId);

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  // Create x402 payment requirements
  const paymentRequirements = createPaymentRequirements(
    sessionId,
    session.totalAmount,
    merchant.walletAddress,
    `Tip payment to ${merchant.name}`
  );

  // Update session status
  SessionRepo.updateStatus(sessionId, "payment_pending");

  return {
    session,
    merchant,
    paymentRequirements: paymentRequirements as PaymentRequirements,
  };
}

// ============================================
// VERIFY PAYMENT
// ============================================

export async function verifyPayment(
  sessionId: string,
  paymentPayload: string
): Promise<VerifyPaymentResponse> {
  const session = SessionRepo.findById(sessionId);

  if (!session) {
    return { isValid: false, invalidReason: "Session not found" };
  }

  if (session.status === "confirmed") {
    return { isValid: false, invalidReason: "Payment already confirmed" };
  }

  if (session.status === "expired") {
    return { isValid: false, invalidReason: "Session expired" };
  }

  const merchant = MerchantRepo.findById(session.merchantId);

  if (!merchant) {
    return { isValid: false, invalidReason: "Merchant not found" };
  }

  try {
    const facilitator = getFacilitator();
    const paymentRequirements = createPaymentRequirements(
      sessionId,
      session.totalAmount!,
      merchant.walletAddress
    );

    const result = await facilitator.verify(
      paymentPayload,
      paymentRequirements
    );

    return result;
  } catch (error) {
    return {
      isValid: false,
      invalidReason:
        error instanceof Error ? error.message : "Verification failed",
    };
  }
}

// ============================================
// SETTLE PAYMENT
// ============================================

export async function settlePayment(
  sessionId: string,
  paymentPayload: string,
  payerAddress: string
): Promise<SettlePaymentResponse> {
  const session = SessionRepo.findById(sessionId);

  if (!session) {
    return { success: false, error: "Session not found" };
  }

  if (session.status === "confirmed") {
    return { success: false, error: "Payment already confirmed" };
  }

  const merchant = MerchantRepo.findById(session.merchantId);

  if (!merchant) {
    return { success: false, error: "Merchant not found" };
  }

  try {
    // Update session to processing
    SessionRepo.updateStatus(sessionId, "payment_processing", payerAddress);

    const facilitator = getFacilitator();
    const paymentRequirements = createPaymentRequirements(
      sessionId,
      session.totalAmount!,
      merchant.walletAddress
    );

    // Settle the payment
    const result = await facilitator.settle(
      paymentPayload,
      paymentRequirements
    );

    if (result.success && result.txHash) {
      // Create transaction record
      const transaction = TransactionRepo.create({
        sessionId,
        merchantId: session.merchantId,
        payerAddress,
        recipientAddress: merchant.walletAddress,
        billAmount: session.billAmount,
        tipAmount: session.tipAmount!,
        totalAmount: session.totalAmount!,
        currency: session.currency,
        txHash: result.txHash,
        networkId: result.networkId!,
      });

      // Confirm the transaction
      TransactionRepo.confirm(transaction.id);

      // Update session status
      SessionRepo.updateStatus(sessionId, "confirmed");

      return {
        success: true,
        txHash: result.txHash,
        networkId: result.networkId,
      };
    } else {
      // Payment failed
      SessionRepo.updateStatus(sessionId, "failed");

      return {
        success: false,
        error: result.error || "Settlement failed",
      };
    }
  } catch (error) {
    SessionRepo.updateStatus(sessionId, "failed");

    return {
      success: false,
      error: error instanceof Error ? error.message : "Settlement failed",
    };
  }
}

// ============================================
// GET PAYMENT STATUS
// ============================================

export function getPaymentStatus(sessionId: string): {
  session: TipSession | null;
  transaction: ReturnType<typeof TransactionRepo.findBySessionId>;
} {
  const session = SessionRepo.findById(sessionId);
  const transaction = TransactionRepo.findBySessionId(sessionId);

  return { session, transaction };
}

// ============================================
// GENERATE PAYMENT URL
// ============================================

export function generatePaymentUrl(sessionId: string, baseUrl: string): string {
  const session = SessionRepo.findById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  const merchant = MerchantRepo.findById(session.merchantId);

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  const params = new URLSearchParams({
    merchant: merchant.slug,
    bill: session.billAmount.toString(),
    tip: (session.tipAmount || 0).toString(),
    total: (session.totalAmount || session.billAmount).toString(),
    session: sessionId,
    payTo: merchant.walletAddress,
  });

  return `${baseUrl}/pay?${params.toString()}`;
}

// ============================================
// GET EXPLORER URL
// ============================================

export function getExplorerUrl(txHash: string): string {
  const chainConfig = getChainConfig();
  return `${chainConfig.explorer}/tx/${txHash}`;
}

// ============================================
// TIP SPLIT SERVICE
// ============================================

import { TipSplitRepo, MerchantRepo } from "../db/models.js";
import type { TipSplit } from "../types/index.js";

// Split calculation result
export interface SplitCalculation {
  name: string;
  percentage: number;
  amount: number;
  walletAddress?: string;
}

// ============================================
// Calculate tip split distribution
// ============================================
export function calculateTipSplit(
  tipAmount: number,
  splits: TipSplit[]
): SplitCalculation[] {
  return splits.map((split) => ({
    name: split.name,
    percentage: split.percentage,
    amount: Math.round(tipAmount * (split.percentage / 100) * 100) / 100,
    walletAddress: split.walletAddress,
  }));
}

// ============================================
// Get split calculation for a merchant
// ============================================
export function getMerchantTipSplit(
  merchantId: string,
  tipAmount: number
): { splits: SplitCalculation[]; total: number } | null {
  // Find merchant
  let merchant = MerchantRepo.findById(merchantId);
  if (!merchant) {
    merchant = MerchantRepo.findBySlug(merchantId);
  }

  if (!merchant) {
    return null;
  }

  // Get split configuration
  const splitConfig = TipSplitRepo.getByMerchantId(merchant.id);

  // Calculate splits
  const splits = calculateTipSplit(tipAmount, splitConfig.splits);
  const total = splits.reduce((sum, s) => sum + s.amount, 0);

  return { splits, total };
}

// ============================================
// Validate split configuration
// ============================================
export function validateSplitConfig(splits: TipSplit[]): {
  valid: boolean;
  error?: string;
} {
  if (!splits || splits.length === 0) {
    return { valid: false, error: "At least one split is required" };
  }

  const totalPercentage = splits.reduce(
    (sum, split) => sum + split.percentage,
    0
  );

  if (Math.abs(totalPercentage - 100) > 0.01) {
    return {
      valid: false,
      error: `Split percentages must sum to 100% (currently ${totalPercentage}%)`,
    };
  }

  for (const split of splits) {
    if (!split.name || split.name.trim() === "") {
      return { valid: false, error: "Each split must have a name" };
    }
    if (split.percentage < 0 || split.percentage > 100) {
      return { valid: false, error: "Percentage must be between 0 and 100" };
    }
  }

  return { valid: true };
}

// ============================================
// Default split configuration
// ============================================
export function getDefaultSplitConfig(): TipSplit[] {
  return [
    { name: "Front Of House", percentage: 60 },
    { name: "Back Of House", percentage: 30 },
    { name: "Bar", percentage: 10 },
  ];
}

// ============================================
// Format split for display
// ============================================
export function formatSplitDisplay(
  tipAmount: number,
  splits: SplitCalculation[]
): string {
  const lines = splits.map(
    (s) => `${s.name}: $${s.amount.toFixed(2)} (${s.percentage}%)`
  );
  return `$${tipAmount.toFixed(2)} tip split:\n${lines.join("\n")}`;
}

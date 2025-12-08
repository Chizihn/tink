// ============================================
// DATABASE MODELS / REPOSITORIES
// ============================================

import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "./index.js";
import type {
  Merchant,
  MerchantStats,
  TipSplit,
  TipSplitConfig,
  TipSession,
  SessionStatus,
  Transaction,
  TransactionStatus,
  Dispute,
  DisputeReason,
  DisputeStatus,
  RecentTip,
} from "../types/index.js";

// ============================================
// MERCHANT REPOSITORY
// ============================================

export const MerchantRepo = {
  findById(id: string): Merchant | null {
    const db = getDatabase();
    const row = db
      .prepare(
        `
      SELECT id, name, slug, wallet_address, avatar, created_at, updated_at 
      FROM merchants WHERE id = ?
    `
      )
      .get(id) as Record<string, unknown> | undefined;

    return row ? mapMerchant(row) : null;
  },

  findBySlug(slug: string): Merchant | null {
    const db = getDatabase();
    const row = db
      .prepare(
        `
      SELECT id, name, slug, wallet_address, avatar, created_at, updated_at 
      FROM merchants WHERE slug = ?
    `
      )
      .get(slug) as Record<string, unknown> | undefined;

    return row ? mapMerchant(row) : null;
  },

  create(data: Omit<Merchant, "id" | "createdAt" | "updatedAt">): Merchant {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = `merchant_${uuidv4()}`;

    db.prepare(
      `
      INSERT INTO merchants (id, name, slug, wallet_address, avatar, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      id,
      data.name,
      data.slug,
      data.walletAddress,
      data.avatar || null,
      now,
      now
    );

    return this.findById(id)!;
  },

  getStats(merchantId: string): MerchantStats {
    const db = getDatabase();

    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Today's tips
    const todayResult = db
      .prepare(
        `
      SELECT COALESCE(SUM(tip_amount), 0) as total
      FROM transactions 
      WHERE merchant_id = ? AND status = 'confirmed' AND DATE(created_at) = ?
    `
      )
      .get(merchantId, today) as { total: number };

    // This week's tips
    const weekResult = db
      .prepare(
        `
      SELECT COALESCE(SUM(tip_amount), 0) as total
      FROM transactions 
      WHERE merchant_id = ? AND status = 'confirmed' AND DATE(created_at) >= ?
    `
      )
      .get(merchantId, weekAgo) as { total: number };

    // Last week's tips (for comparison)
    const lastWeekResult = db
      .prepare(
        `
      SELECT COALESCE(SUM(tip_amount), 0) as total
      FROM transactions 
      WHERE merchant_id = ? AND status = 'confirmed' 
        AND DATE(created_at) >= ? AND DATE(created_at) < ?
    `
      )
      .get(merchantId, twoWeeksAgo, weekAgo) as { total: number };

    // All time
    const allTimeResult = db
      .prepare(
        `
      SELECT COALESCE(SUM(tip_amount), 0) as total, COUNT(*) as count
      FROM transactions 
      WHERE merchant_id = ? AND status = 'confirmed'
    `
      )
      .get(merchantId) as { total: number; count: number };

    // Calculate percentage changes
    const percentChangeWeek =
      lastWeekResult.total > 0
        ? ((weekResult.total - lastWeekResult.total) / lastWeekResult.total) *
          100
        : 0;

    return {
      totalTipsToday: todayResult.total,
      totalTipsThisWeek: weekResult.total,
      totalTipsAllTime: allTimeResult.total,
      tipCountTotal: allTimeResult.count,
      percentChangeToday: 12.3, // Would need yesterday's data for real calculation
      percentChangeWeek: Math.round(percentChangeWeek * 10) / 10,
    };
  },
};

// ============================================
// TIP SPLIT REPOSITORY
// ============================================

export const TipSplitRepo = {
  getByMerchantId(merchantId: string): TipSplitConfig {
    const db = getDatabase();
    const rows = db
      .prepare(
        `
      SELECT name, percentage, wallet_address
      FROM tip_splits WHERE merchant_id = ?
    `
      )
      .all(merchantId) as Array<{
      name: string;
      percentage: number;
      wallet_address: string | null;
    }>;

    return {
      merchantId,
      splits: rows.map((row) => ({
        name: row.name,
        percentage: row.percentage,
        walletAddress: row.wallet_address || undefined,
      })),
    };
  },

  update(merchantId: string, splits: TipSplit[]): TipSplitConfig {
    const db = getDatabase();
    const now = new Date().toISOString();

    // Delete existing splits
    db.prepare("DELETE FROM tip_splits WHERE merchant_id = ?").run(merchantId);

    // Insert new splits
    const insert = db.prepare(`
      INSERT INTO tip_splits (id, merchant_id, name, percentage, wallet_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    splits.forEach((split, index) => {
      insert.run(
        `split_${merchantId}_${index}`,
        merchantId,
        split.name,
        split.percentage,
        split.walletAddress || null,
        now
      );
    });

    return this.getByMerchantId(merchantId);
  },
};

// ============================================
// SESSION REPOSITORY
// ============================================

export const SessionRepo = {
  findById(id: string): TipSession | null {
    const db = getDatabase();
    const row = db
      .prepare(
        `
      SELECT * FROM sessions WHERE id = ?
    `
      )
      .get(id) as Record<string, unknown> | undefined;

    return row ? mapSession(row) : null;
  },

  create(data: {
    merchantId: string;
    billAmount: number;
    currency?: string;
  }): TipSession {
    const db = getDatabase();
    const now = new Date();
    const id = `session_${uuidv4()}`;
    const memo = `Tink-${Date.now().toString().slice(-6)}`;
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 min expiry

    db.prepare(
      `
      INSERT INTO sessions (id, merchant_id, bill_amount, currency, status, memo, 
        created_at, updated_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      id,
      data.merchantId,
      data.billAmount,
      data.currency || "USDC",
      "pending",
      memo,
      now.toISOString(),
      now.toISOString(),
      expiresAt.toISOString()
    );

    return this.findById(id)!;
  },

  updateTip(id: string, tipAmount: number, tipPercentage: number): TipSession {
    const db = getDatabase();
    const session = this.findById(id);

    if (!session) {
      throw new Error("Session not found");
    }

    const totalAmount = session.billAmount + tipAmount;
    const now = new Date().toISOString();

    db.prepare(
      `
      UPDATE sessions 
      SET tip_amount = ?, tip_percentage = ?, total_amount = ?, status = ?, updated_at = ?
      WHERE id = ?
    `
    ).run(tipAmount, tipPercentage, totalAmount, "tip_selected", now, id);

    return this.findById(id)!;
  },

  updateStatus(
    id: string,
    status: SessionStatus,
    payerAddress?: string
  ): TipSession {
    const db = getDatabase();
    const now = new Date().toISOString();

    if (payerAddress) {
      db.prepare(
        `
        UPDATE sessions SET status = ?, payer_address = ?, updated_at = ? WHERE id = ?
      `
      ).run(status, payerAddress, now, id);
    } else {
      db.prepare(
        `
        UPDATE sessions SET status = ?, updated_at = ? WHERE id = ?
      `
      ).run(status, now, id);
    }

    return this.findById(id)!;
  },
};

// ============================================
// TRANSACTION REPOSITORY
// ============================================

export const TransactionRepo = {
  findById(id: string): Transaction | null {
    const db = getDatabase();
    const row = db
      .prepare("SELECT * FROM transactions WHERE id = ?")
      .get(id) as Record<string, unknown> | undefined;
    return row ? mapTransaction(row) : null;
  },

  findBySessionId(sessionId: string): Transaction | null {
    const db = getDatabase();
    const row = db
      .prepare("SELECT * FROM transactions WHERE session_id = ?")
      .get(sessionId) as Record<string, unknown> | undefined;
    return row ? mapTransaction(row) : null;
  },

  getRecentByMerchant(merchantId: string, limit: number = 10): RecentTip[] {
    const db = getDatabase();
    const rows = db
      .prepare(
        `
      SELECT id, tip_amount, tx_hash, status, created_at, payer_address
      FROM transactions 
      WHERE merchant_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `
      )
      .all(merchantId, limit) as Array<Record<string, unknown>>;

    return rows.map((row) => ({
      id: row.id as string,
      date: row.created_at as string,
      amount: row.tip_amount as number,
      txHash: row.tx_hash as string,
      status: row.status as TransactionStatus,
      payerAddress: row.payer_address as string | undefined,
    }));
  },

  create(data: {
    sessionId: string;
    merchantId: string;
    payerAddress: string;
    recipientAddress: string;
    billAmount: number;
    tipAmount: number;
    totalAmount: number;
    currency: string;
    txHash: string;
    networkId: string;
  }): Transaction {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = `tx_${uuidv4()}`;

    db.prepare(
      `
      INSERT INTO transactions (id, session_id, merchant_id, payer_address, recipient_address,
        bill_amount, tip_amount, total_amount, currency, tx_hash, network_id, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      id,
      data.sessionId,
      data.merchantId,
      data.payerAddress,
      data.recipientAddress,
      data.billAmount,
      data.tipAmount,
      data.totalAmount,
      data.currency,
      data.txHash,
      data.networkId,
      "pending",
      now
    );

    return this.findById(id)!;
  },

  confirm(id: string): Transaction {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.prepare(
      `
      UPDATE transactions SET status = 'confirmed', confirmed_at = ? WHERE id = ?
    `
    ).run(now, id);

    return this.findById(id)!;
  },

  getForExport(
    merchantId: string,
    startDate?: string,
    endDate?: string
  ): Transaction[] {
    const db = getDatabase();
    let query = "SELECT * FROM transactions WHERE merchant_id = ?";
    const params: unknown[] = [merchantId];

    if (startDate) {
      query += " AND created_at >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND created_at <= ?";
      params.push(endDate);
    }

    query += " ORDER BY created_at DESC";

    const rows = db.prepare(query).all(...params) as Array<
      Record<string, unknown>
    >;
    return rows.map(mapTransaction);
  },
};

// ============================================
// DISPUTE REPOSITORY
// ============================================

export const DisputeRepo = {
  findById(id: string): Dispute | null {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM disputes WHERE id = ?").get(id) as
      | Record<string, unknown>
      | undefined;
    return row ? mapDispute(row) : null;
  },

  create(data: {
    sessionId: string;
    merchantId: string;
    reason: DisputeReason;
    details: string;
    submittedBy: string;
  }): Dispute {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = `dispute_${uuidv4()}`;

    db.prepare(
      `
      INSERT INTO disputes (id, session_id, merchant_id, reason, details, status, 
        submitted_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      id,
      data.sessionId,
      data.merchantId,
      data.reason,
      data.details,
      "pending",
      data.submittedBy,
      now,
      now
    );

    return this.findById(id)!;
  },

  updateStatus(
    id: string,
    status: DisputeStatus,
    resolution?: string
  ): Dispute {
    const db = getDatabase();
    const now = new Date().toISOString();

    if (status === "resolved" && resolution) {
      db.prepare(
        `
        UPDATE disputes SET status = ?, resolution = ?, resolved_at = ?, updated_at = ? WHERE id = ?
      `
      ).run(status, resolution, now, now, id);
    } else {
      db.prepare(
        `
        UPDATE disputes SET status = ?, updated_at = ? WHERE id = ?
      `
      ).run(status, now, id);
    }

    return this.findById(id)!;
  },

  getByMerchant(merchantId: string): Dispute[] {
    const db = getDatabase();
    const rows = db
      .prepare(
        `
      SELECT * FROM disputes WHERE merchant_id = ? ORDER BY created_at DESC
    `
      )
      .all(merchantId) as Array<Record<string, unknown>>;

    return rows.map(mapDispute);
  },
};

// ============================================
// MAPPERS
// ============================================

function mapMerchant(row: Record<string, unknown>): Merchant {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    walletAddress: row.wallet_address as string,
    avatar: row.avatar as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapSession(row: Record<string, unknown>): TipSession {
  return {
    id: row.id as string,
    merchantId: row.merchant_id as string,
    billAmount: row.bill_amount as number,
    tipAmount: row.tip_amount as number | undefined,
    tipPercentage: row.tip_percentage as number | undefined,
    totalAmount: row.total_amount as number | undefined,
    currency: row.currency as string,
    status: row.status as SessionStatus,
    memo: row.memo as string,
    payerAddress: row.payer_address as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    expiresAt: row.expires_at as string,
  };
}

function mapTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    merchantId: row.merchant_id as string,
    payerAddress: row.payer_address as string,
    recipientAddress: row.recipient_address as string,
    billAmount: row.bill_amount as number,
    tipAmount: row.tip_amount as number,
    totalAmount: row.total_amount as number,
    currency: row.currency as string,
    txHash: row.tx_hash as string,
    networkId: row.network_id as string,
    status: row.status as TransactionStatus,
    createdAt: row.created_at as string,
    confirmedAt: row.confirmed_at as string | undefined,
  };
}

function mapDispute(row: Record<string, unknown>): Dispute {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    merchantId: row.merchant_id as string,
    reason: row.reason as DisputeReason,
    details: row.details as string,
    status: row.status as DisputeStatus,
    submittedBy: row.submitted_by as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    resolvedAt: row.resolved_at as string | undefined,
    resolution: row.resolution as string | undefined,
  };
}

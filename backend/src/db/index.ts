// ============================================
// DATABASE SETUP (SQLite for hackathon speed)
// ============================================

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || "./data/tink.db";
    const dbDir = path.dirname(dbPath);

    // Ensure directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");

    // Initialize tables
    initializeTables(db);
  }

  return db;
}

function initializeTables(db: Database.Database): void {
  // Merchants table
  db.exec(`
    CREATE TABLE IF NOT EXISTS merchants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      wallet_address TEXT NOT NULL,
      avatar TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Tip split configurations
  db.exec(`
    CREATE TABLE IF NOT EXISTS tip_splits (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      percentage REAL NOT NULL,
      wallet_address TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (merchant_id) REFERENCES merchants(id)
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL,
      bill_amount REAL NOT NULL,
      tip_amount REAL,
      tip_percentage REAL,
      total_amount REAL,
      currency TEXT NOT NULL DEFAULT 'USDC',
      status TEXT NOT NULL DEFAULT 'pending',
      memo TEXT NOT NULL,
      payer_address TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (merchant_id) REFERENCES merchants(id)
    )
  `);

  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      merchant_id TEXT NOT NULL,
      payer_address TEXT NOT NULL,
      recipient_address TEXT NOT NULL,
      bill_amount REAL NOT NULL,
      tip_amount REAL NOT NULL,
      total_amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USDC',
      tx_hash TEXT NOT NULL,
      network_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      confirmed_at TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (merchant_id) REFERENCES merchants(id)
    )
  `);

  // Disputes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      merchant_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      submitted_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      resolved_at TEXT,
      resolution TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (merchant_id) REFERENCES merchants(id)
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_merchant ON sessions(merchant_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
    CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_session ON transactions(session_id);
    CREATE INDEX IF NOT EXISTS idx_disputes_merchant ON disputes(merchant_id);
    CREATE INDEX IF NOT EXISTS idx_disputes_session ON disputes(session_id);
  `);

  // Seed demo merchant if not exists
  seedDemoData(db);
}

function seedDemoData(db: Database.Database): void {
  const existingMerchant = db
    .prepare("SELECT id FROM merchants WHERE slug = ?")
    .get("demo-cafe");

  if (!existingMerchant) {
    const now = new Date().toISOString();

    // Insert demo merchant
    db.prepare(
      `
      INSERT INTO merchants (id, name, slug, wallet_address, avatar, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      "merchant_demo_cafe",
      "Demo Cafe",
      "demo-cafe",
      "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // Example address
      null,
      now,
      now
    );

    // Insert default tip splits
    const splits = [
      { name: "Front Of House", percentage: 60 },
      { name: "Back Of House", percentage: 30 },
      { name: "Bar", percentage: 10 },
    ];

    const insertSplit = db.prepare(`
      INSERT INTO tip_splits (id, merchant_id, name, percentage, wallet_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    splits.forEach((split, index) => {
      insertSplit.run(
        `split_demo_${index}`,
        "merchant_demo_cafe",
        split.name,
        split.percentage,
        null,
        now
      );
    });

    // Insert some sample transactions for dashboard demo
    const sampleTxs = [
      { amount: 2.5, date: "2025-12-07" },
      { amount: 5.0, date: "2025-12-06" },
    ];

    const insertTx = db.prepare(`
      INSERT INTO transactions (id, session_id, merchant_id, payer_address, recipient_address, 
        bill_amount, tip_amount, total_amount, currency, tx_hash, network_id, status, created_at, confirmed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sampleTxs.forEach((tx, index) => {
      const sessionId = `session_sample_${index}`;

      // Create session first
      db.prepare(
        `
        INSERT INTO sessions (id, merchant_id, bill_amount, tip_amount, total_amount, currency, 
          status, memo, payer_address, created_at, updated_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      ).run(
        sessionId,
        "merchant_demo_cafe",
        10.0,
        tx.amount,
        10.0 + tx.amount,
        "USDC",
        "confirmed",
        `Tink-${100000 + index}`,
        "0x742d35Cc6634C0532925a3b844Bc9e7595f",
        tx.date + "T12:00:00Z",
        tx.date + "T12:00:00Z",
        tx.date + "T12:30:00Z"
      );

      insertTx.run(
        `tx_sample_${index}`,
        sessionId,
        "merchant_demo_cafe",
        "0x742d35Cc6634C0532925a3b844Bc9e7595f",
        "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        10.0,
        tx.amount,
        10.0 + tx.amount,
        "USDC",
        `0x123${index}...abc`,
        "avalanche-fuji",
        "confirmed",
        tx.date + "T12:00:00Z",
        tx.date + "T12:01:00Z"
      );
    });

    console.log("✅ Demo data seeded successfully");
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

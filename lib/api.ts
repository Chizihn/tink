export interface Merchant {
  id: string;
  name: string;
  logo: string;
  address: string;
}

export interface TipSession {
  id: string;
  merchantId: string;
  billAmount?: number;
  currency: string;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  network: string;
  pay_to: string;
  token_mint: string;
  memo: string;
  expires_at: string;
}

export interface ResourceResponse {
  code: number;
  message: string;
  payment: PaymentDetails;
  session: string;
  ai_suggestion: number;
}

export interface VerifyResponse {
  status: "pending" | "confirmed" | "failed";
  receipt_id: string;
}

export interface TipEvent {
  id: number;
  session: string;
  merchantId: string;
  amount: string;
  currency: string;
  status: "pending" | "confirmed" | "failed";
  tx_hash: string;
  created_at: string;
  split: { FOH: number; BOH: number; Bar: number };
}

export interface SplitSimulationResponse {
  total: number;
  split: { FOH: number; BOH: number; Bar: number };
}

export interface SplitConfig {
  FOH: number;
  BOH: number;
  Bar: number;
}

// --- MOCK DATA ---

const MOCK_RESOURCE_RESPONSE: ResourceResponse = {
  code: 200,
  message: "Success",
  payment: {
    amount: 10.0,
    currency: "USDC",
    network: "Avalanche",
    pay_to: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    token_mint: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    memo: "Tink-123456",
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  },
  session: "mock-session-123",
  ai_suggestion: 0.15,
};

const MOCK_VERIFY_RESPONSE: VerifyResponse = {
  status: "confirmed",
  receipt_id: "rcpt_mock_123",
};

const MOCK_TIPS: TipEvent[] = [
  {
    id: 1,
    session: "mock-session-123",
    merchantId: "demo-cafe",
    amount: "2.50",
    currency: "USDC",
    status: "confirmed",
    tx_hash: "0x123...abc",
    created_at: new Date().toISOString(),
    split: { FOH: 60, BOH: 30, Bar: 10 },
  },
  {
    id: 2,
    session: "mock-session-456",
    merchantId: "demo-cafe",
    amount: "5.00",
    currency: "USDC",
    status: "confirmed",
    tx_hash: "0x456...def",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    split: { FOH: 50, BOH: 50, Bar: 0 },
  },
];

const MOCK_SPLIT_SIMULATION: SplitSimulationResponse = {
  total: 12.5,
  split: { FOH: 7.5, BOH: 3.75, Bar: 1.25 },
};


export async function getResource(
  session: string,
  merchantId: string
): Promise<ResourceResponse> {
  // const res = await fetch(
  //   `${API_BASE_URL}/api/resource?session=${session}&merchantId=${merchantId}`
  // );
  // if (!res.ok) {
  //   throw new Error("Failed to fetch resource");
  // }
  // return res.json();
  console.log(`[Mock] getResource called with session=${session}, merchantId=${merchantId}`);
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_RESOURCE_RESPONSE), 500));
}

export async function verifyPayment(
  session: string,
  txHash: string
): Promise<VerifyResponse> {
  // const res = await fetch(`${API_BASE_URL}/api/verify`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ session, tx_hash: txHash }),
  // });
  // if (!res.ok) {
  //   throw new Error("Failed to verify payment");
  // }
  // return res.json();
  console.log(`[Mock] verifyPayment called with session=${session}, txHash=${txHash}`);
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_VERIFY_RESPONSE), 1000));
}

export async function getMerchantTips(merchantId: string): Promise<TipEvent[]> {
  // const res = await fetch(`${API_BASE_URL}/api/merchant/${merchantId}/tips`);
  // if (!res.ok) {
  //   throw new Error("Failed to fetch merchant tips");
  // }
  // return res.json();
  console.log(`[Mock] getMerchantTips called with merchantId=${merchantId}`);
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_TIPS), 600));
}

export async function simulateSplit(
  merchantId: string,
  total: number
): Promise<SplitSimulationResponse> {
  // const res = await fetch(
  //   `${API_BASE_URL}/api/merchant/${merchantId}/split?total=${total}`
  // );
  // if (!res.ok) {
  //   throw new Error("Failed to simulate split");
  // }
  // return res.json();
  console.log(`[Mock] simulateSplit called with merchantId=${merchantId}, total=${total}`);
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_SPLIT_SIMULATION), 400));
}

export async function saveSplit(
  merchantId: string,
  split: SplitConfig
): Promise<{ status: string; message: string }> {
  // const res = await fetch(`${API_BASE_URL}/api/merchant/${merchantId}/split`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(split),
  // });
  // if (!res.ok) {
  //   throw new Error("Failed to save split configuration");
  // }
  // return res.json();
  console.log(`[Mock] saveSplit called with merchantId=${merchantId}, split=`, split);
  return new Promise((resolve) => setTimeout(() => resolve({ status: "success", message: "Split configuration saved" }), 800));
}

export async function submitDispute(
  session: string,
  reason: string
): Promise<{ status: string; message: string }> {
  // const res = await fetch(`${API_BASE_URL}/api/dispute`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ session, reason }),
  // });
  // if (!res.ok) {
  //   throw new Error("Failed to submit dispute");
  // }
  // return res.json();
  console.log(`[Mock] submitDispute called with session=${session}, reason=${reason}`);
  return new Promise((resolve) => setTimeout(() => resolve({ status: "success", message: "Dispute submitted" }), 700));
}

// Helper to get merchant details from the resource response or a separate endpoint if needed.
// For now, we'll keep a mock or assume the resource endpoint provides enough info,
// but the current api.txt doesn't show a dedicated merchant details endpoint.
// We will use the MOCK_MERCHANTS for display purposes (name, logo) if not provided by API,
// or we can infer it.
// However, the existing code uses getMerchant. Let's keep a shim for now or update usage.
// The api.txt doesn't have GET /api/merchant/:id.
// We will keep the mock for static merchant data (logo, name) since the API doesn't seem to return it.

export const MOCK_MERCHANTS: Record<string, Merchant> = {
  "demo-cafe": {
    id: "demo-cafe",
    name: "Demo Cafe",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=DC&backgroundColor=E84142",
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // Updated to match api.txt pay_to potentially
  },
};

export async function getMerchant(id: string): Promise<Merchant | null> {
  // In a real app, this might come from an endpoint.
  // For now, return mock data to keep the UI working.
  return MOCK_MERCHANTS[id] || MOCK_MERCHANTS["demo-cafe"];
}

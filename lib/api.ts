const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// --- Types ---

export interface Merchant {
  id: string;
  name: string;
  logo: string;
  address: string;
}

export interface MerchantStats {
  today: number;
  week: number;
  allTime: number;
  totalCount: number;
  growth: {
    today: string;
    week: string;
  }
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
  split?: { FOH: number; BOH: number; Bar: number };
}

export interface SplitConfig {
  FOH: number;
  BOH: number;
  Bar: number;
}

export interface Session {
  id: string;
  merchantId: string;
  billAmount: number;
  tipAmount: number;
  totalAmount: number;
  status: "active" | "completed" | "cancelled";
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
  ai_suggestion?: number;
}

export interface VerifyResponse {
  status: "pending" | "confirmed" | "failed";
  receipt_id: string;
}

export interface DisputeReason {
  id: string;
  label: string;
}

export interface WidgetConfig {
  [key: string]: any;
}

// --- API CLIENT ---

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API call failed: ${res.status} ${res.statusText} - ${errorBody}`);
  }

  // Handle Blob response for downloads (rudimentary check, mostly we expect JSON)
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res.text() as unknown as T; // Fallback or for non-json
}

// === MERCHANTS ===

// GET /api/merchants - Get all merchants
export async function getMerchants(): Promise<Merchant[]> {
  return apiCall<Merchant[]>("/api/merchants");
}

// GET /api/merchants/:id - Get merchant info
export async function getMerchant(id: string): Promise<Merchant> {
  return apiCall<Merchant>(`/api/merchants/${id}`);
}

// POST /api/merchants - Create new merchant
export async function createMerchant(data: any): Promise<Merchant> {
  return apiCall<Merchant>("/api/merchants", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// GET /api/merchants/:id/stats - Dashboard stats
export async function getMerchantStats(id: string): Promise<MerchantStats> {
  return apiCall<MerchantStats>(`/api/merchants/${id}/stats`);
}

// GET /api/merchants/:id/tips - Recent tips list
export async function getMerchantTips(id: string): Promise<TipEvent[]> {
  return apiCall<TipEvent[]>(`/api/merchants/${id}/tips`);
}

// GET /api/merchants/:id/tips/export - Export CSV
export async function exportMerchantTipsUrl(id: string): Promise<string> {
  // This usually returns a download, so we might just return the URL for window.open
  return `${API_BASE_URL}/api/merchants/${id}/tips/export`;
}

// GET /api/merchants/:id/split-config - Get tip split config
export async function getSplitConfig(id: string): Promise<SplitConfig> {
  return apiCall<SplitConfig>(`/api/merchants/${id}/split-config`);
}

// PUT /api/merchants/:id/split-config - Update tip split config
export async function updateSplitConfig(id: string, config: SplitConfig): Promise<SplitConfig> {
  return apiCall<SplitConfig>(`/api/merchants/${id}/split-config`, {
    method: "PUT",
    body: JSON.stringify(config),
  });
}

// === SESSIONS ===

// POST /api/sessions - Create session
export async function createSession(data: { merchantId: string; billAmount: number; currency?: string }): Promise<Session> {
  return apiCall<Session>("/api/sessions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// GET /api/sessions/:id - Get session
export async function getSession(id: string): Promise<Session> {
  return apiCall<Session>(`/api/sessions/${id}`);
}

// PATCH /api/sessions/:id/tip - Update tip
export async function updateSessionTip(id: string, tipAmount: number): Promise<Session> {
  return apiCall<Session>(`/api/sessions/${id}/tip`, {
    method: "PATCH",
    body: JSON.stringify({ tipAmount }),
  });
}

// POST /api/sessions/:id/cancel - Cancel session
export async function cancelSession(id: string): Promise<{ success: boolean }> {
  return apiCall<{ success: boolean }>(`/api/sessions/${id}/cancel`, {
    method: "POST",
  });
}

// === TIPS ===

// POST /api/tips/calculate - Calculate options (Round Up, 10%, 15%, 20%)
export async function calculateTipOptions(billAmount: number): Promise<{ options: number[] }> {
  return apiCall<{ options: number[] }>("/api/tips/calculate", {
    method: "POST",
    body: JSON.stringify({ billAmount }),
  });
}

// POST /api/tips/ai-suggestion - AI suggestion
export async function getAiSuggestion(billAmount: number): Promise<{ suggestion: number; reason?: string }> {
  return apiCall<{ suggestion: number; reason?: string }>("/api/tips/ai-suggestion", {
    method: "POST",
    body: JSON.stringify({ billAmount }),
  });
}

// POST /api/tips/split - Split calculation
export async function calculateSplit(amount: number, config: SplitConfig): Promise<{ split: { FOH: number; BOH: number; Bar: number } }> {
  return apiCall<{ split: { FOH: number; BOH: number; Bar: number } }>("/api/tips/split", {
    method: "POST",
    body: JSON.stringify({ amount, config }),
  });
}

// GET /api/tips/percentages - Get tip percentages
export async function getTipPercentages(): Promise<number[]> {
  return apiCall<number[]>("/api/tips/percentages");
}


// === PAYMENTS ===

// POST /api/payments/prepare - Prepare x402 payment
export async function preparePayment(session: string, merchantId?: string): Promise<ResourceResponse> {
  return apiCall<ResourceResponse>("/api/payments/prepare", {
    method: "POST",
    body: JSON.stringify({ session, merchantId }),
  });
}

// POST /api/payments/verify - Verify signature
export async function verifyPayment(session: string, txHash: string): Promise<VerifyResponse> {
  return apiCall<VerifyResponse>("/api/payments/verify", {
    method: "POST",
    body: JSON.stringify({ session, tx_hash: txHash }),
  });
}

// POST /api/payments/settle - Settle on-chain
export async function settlePayment(session: string, signature: string, authorization: any): Promise<VerifyResponse> {
  return apiCall<VerifyResponse>("/api/payments/settle", {
    method: "POST",
    body: JSON.stringify({ session, signature, authorization }),
  });
}

// GET /api/payments/status/:sessionId - Get status
export async function getPaymentStatus(sessionId: string): Promise<{ status: string }> {
  return apiCall<{ status: string }>(`/api/payments/status/${sessionId}`);
}

// POST /api/payments/url - Generate payment URL
export async function generatePaymentUrl(amount: number, currency: string, merchantId: string): Promise<{ url: string }> {
  return apiCall<{ url: string }>("/api/payments/url", {
    method: "POST",
    body: JSON.stringify({ amount, currency, merchantId }),
  });
}

// GET /api/payments/supported - Get supported methods
export async function getSupportedMethods(): Promise<any> {
  return apiCall("/api/payments/supported");
}

// GET /api/payments/config - Get chain config
export async function getChainConfig(): Promise<any> {
  return apiCall("/api/payments/config");
}


// === RECEIPTS ===

// GET /api/receipts/:sessionId - Get receipt details
export async function getReceipt(sessionId: string): Promise<TipEvent> {
  return apiCall<TipEvent>(`/api/receipts/${sessionId}`);
}

// GET /api/receipts/:sessionId/share - Get shareable URL
export async function getReceiptShareUrl(sessionId: string): Promise<{ url: string }> {
  return apiCall<{ url: string }>(`/api/receipts/${sessionId}/share`);
}

// GET /api/receipts/:sessionId/download - Download receipt JSON
export async function downloadReceipt(sessionId: string): Promise<Blob> {
  // Direct fetch for blob
  const url = `${API_BASE_URL}/api/receipts/${sessionId}/download`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to download receipt");
  return res.blob();
}


// === DISPUTES ===

// POST /api/disputes - Submit dispute
export async function submitDispute(session: string, reason: string): Promise<{ status: string; message: string }> {
  return apiCall<{ status: string; message: string }>("/api/disputes", {
    method: "POST",
    body: JSON.stringify({ session, reason }),
  });
}

// GET /api/disputes/:id - Get dispute
export async function getDispute(id: string): Promise<any> {
  return apiCall(`/api/disputes/${id}`);
}

// GET /api/disputes/merchant/:merchantId - Get merchant disputes
export async function getMerchantDisputes(merchantId: string): Promise<TipEvent[]> {
  return apiCall<TipEvent[]>(`/api/disputes/merchant/${merchantId}`);
}

// PATCH /api/disputes/:id/status - Update dispute status
export async function updateDisputeStatus(id: string, status: string): Promise<any> {
  return apiCall(`/api/disputes/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// GET /api/disputes/meta/reasons - Get dispute reasons
export async function getDisputeReasons(): Promise<DisputeReason[]> {
  return apiCall<DisputeReason[]>("/api/disputes/meta/reasons");
}


// === WEBHOOKS ===

// POST /api/webhooks/payment - Payment confirmation
export async function triggerPaymentWebhook(payload: any): Promise<any> {
  return apiCall("/api/webhooks/payment", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// POST /api/webhooks/test - Test webhook
export async function triggerTestWebhook(): Promise<any> {
  return apiCall("/api/webhooks/test", {
    method: "POST",
  });
}


// === EMBED ===

// GET /api/embed/config - Widget config
export async function getWidgetConfig(): Promise<WidgetConfig> {
  return apiCall<WidgetConfig>("/api/embed/config");
}

// POST /api/embed/session - Create widget session
export async function createWidgetSession(merchantId: string, amount: number): Promise<{ session: string }> {
  return apiCall<{ session: string }>("/api/embed/session", {
    method: "POST",
    body: JSON.stringify({ merchantId, amount }),
  });
}

// GET /api/embed/merchants/:slug - Get merchant for embed
export async function getEmbedMerchant(slug: string): Promise<Merchant> {
  return apiCall<Merchant>(`/api/embed/merchants/${slug}`);
}

// Helper aliases to maintain specific confusing naming from previous steps if needed, 
// but sticking to strict naming is better. 
// getResource is effectively preparePayment + get info.
export async function getResource(session: string, merchantId?: string): Promise<ResourceResponse> {
  return preparePayment(session, merchantId);
}

// Deprecated stubs - removed or strictly mapped now.
// User asked to "consume all the damn endpoints", so everything is mapped above.
// For compatibility, saveSplit -> updateSplitConfig
export async function saveSplit(merchantId: string, split: SplitConfig): Promise<SplitConfig> {
  return updateSplitConfig(merchantId, split);
}




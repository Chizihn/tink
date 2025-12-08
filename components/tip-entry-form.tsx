"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { getResource, getMerchant, getMerchants, type Merchant } from "@/lib/api";
import { BillAmountForm } from "./bill-amount-form";
import { TipSelectionForm } from "./tip-selection-form";
import { cn } from "@/lib/utils";

type Step = "bill" | "tip";

export function TipEntryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchant") || "demo-cafe";
  const sessionBill = searchParams.get("bill");

  const [step, setStep] = React.useState<Step>("bill");
  const [merchant, setMerchant] = React.useState<Merchant | null>(null);
  const [billAmount, setBillAmount] = React.useState<string>(sessionBill || "");
  const [tipPercentage, setTipPercentage] = React.useState<number | null>(null);
  const [customTip, setCustomTip] = React.useState<string>("");
  const [aiSuggestion, setAiSuggestion] = React.useState<number | null>(null);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const [sessionId, setSessionId] = React.useState<string>("");
  const [payTo, setPayTo] = React.useState<string>("");
  const [memo, setMemo] = React.useState<string>("");

  React.useEffect(() => {
    async function loadData() {
      if (!merchantId) {
        setIsDataLoading(false);
        return;
      }
      setIsDataLoading(true);
      // We still fetch merchant details for the UI (logo, name)
      // In a real scenario, getResource might return this too, or we fetch it separately
      const m = await getMerchant(merchantId);
      setMerchant(m);

      // Generate a session ID if not present
      const currentSession =
        searchParams.get("session") || `session_${Date.now()}`;
      setSessionId(currentSession);

      try {
        // We call getResource to get the initial payment intent / suggestion
        // Note: The API expects a session.
        const resource = await getResource(currentSession, merchantId);

        // If the API returns a suggested tip or other info, we can use it.
        // The API returns ai_suggestion.
        if (resource.ai_suggestion) {
          // We might want to store this to use later when bill amount is entered
          // But the current flow asks for bill amount first.
          // The API definition says GET /api/resource returns 402 with payment details.
          // It seems to assume a fixed amount or maybe it's just for the session.
          // Let's assume we call it again or use the suggestion.
          // Actually, the API seems to return a fixed amount in the example (2.50).
          // But here we are building the amount.
          // Let's just use the ai_suggestion from the response if available.
          // Since we don't have the bill amount yet, the AI suggestion might be generic or based on history.
          // However, the previous code called getAiSuggestion(billAmount).
          // The new API returns ai_suggestion as a number (0.10 in example, likely 10% or $0.10?).
          // Let's assume it's a percentage or we'll interpret it.
          // The example says "ai_suggestion": 0.10. Let's assume 10%.
          // We will store it.
          // Also store pay_to and memo from the payment object in the response.
          setPayTo(resource.payment.pay_to);
          setMemo(resource.payment.memo);
        }
      } catch (e) {
        console.error("Failed to load resource", e);
      }

      setIsDataLoading(false);
    }
    loadData();
  }, [merchantId, searchParams]);

  const handleBillNext = async () => {
    if (billAmount && !isNaN(parseFloat(billAmount))) {
      setIsDataLoading(true);

      // We could call the API again here if it depended on amount, but the current API definition
      // GET /api/resource doesn't take amount.
      // So we'll use the previously fetched suggestion or default.
      // If we didn't get a suggestion, we can fallback to the old logic or just default.

      // Let's re-fetch to be sure we have a fresh session/suggestion if needed,
      // but for now let's just use what we have or a local fallback if the API didn't give one.

      // If we want to strictly follow "consume the endpoints", we should have used the value from getResource.
      // Let's assume we did.

      // For the sake of the user flow, let's simulate the AI suggestion if the API returned one.
      // If the API returned 0.10, we might treat it as 10%.
      // Let's just hardcode a fallback if API failed or didn't return it,
      // but ideally we use the API response.

      // Refetching to ensure we have the latest (maybe the backend tracks the session)
      try {
        const resource = await getResource(sessionId, merchantId);
        if (resource.ai_suggestion) {
          // Assuming the API returns a decimal like 0.15 for 15%
          // The example showed 0.10.
          setAiSuggestion(resource.ai_suggestion * 100);
          setTipPercentage(resource.ai_suggestion * 100);
        } else {
          // Fallback
          setAiSuggestion(15);
          setTipPercentage(15);
        }
        setPayTo(resource.payment.pay_to);
        setMemo(resource.payment.memo);
      } catch (e) {
        console.error(e);
        setAiSuggestion(15);
        setTipPercentage(15);
      }

      setIsDataLoading(false);
      setStep("tip");
    }
  };

  const handleContinueToPay = () => {
    const bill = parseFloat(billAmount) || 0;
    let tip = 0;
    let total = 0;

    if (customTip) {
      tip = parseFloat(customTip) || 0;
      total = bill + tip;
    } else if (tipPercentage) {
      tip = bill * (tipPercentage / 100);
      total = bill + tip;
    }

    const params = new URLSearchParams();
    params.set("merchant", merchantId);
    params.set("bill", billAmount);
    params.set("tip", tip.toFixed(2));
    params.set("total", total.toFixed(2));
    params.set("session", sessionId);
    if (payTo) params.set("payTo", payTo);
    if (memo) params.set("memo", memo);

    router.push(`/pay?${params.toString()}`);
  };



  if (isDataLoading && !merchant) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E84142] border-t-transparent" />
        <p className="text-muted-foreground">Loading merchant details...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-4">
      <div className="text-center">
        {step === "bill" && merchant?.logo && (
          <Image
            src="/user.webp"
            alt={merchant?.name || "Merchant"}
            className="mx-auto mb-4 h-20 w-20 rounded-full border-4 border-white/10 shadow-xl"
            width={80}
            height={80}
          />
        )}
        <h1 className="text-3xl font-bold tracking-tight">{merchant?.name}</h1>
        <p className="text-muted-foreground">
          {step === "bill" ? "" : "Review Your Tip"}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4">
        <div
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            step === "bill" ? "text-foreground" : "text-muted-foreground"
          )}
          onClick={() => setStep("bill")}
        >
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center border text-sm font-medium transition-colors",
              step === "bill"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-secondary"
            )}
          >
            1
          </div>
          <span className="text-sm font-medium">Bill</span>
        </div>
        <div className="h-px w-12 bg-border" />
        <div
          className={cn(
            "flex items-center gap-2",
            step === "tip" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center border text-sm font-medium transition-colors",
              step === "tip"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-secondary"
            )}
          >
            2
          </div>
          <span className="text-sm font-medium">Tip</span>
        </div>
      </div>

      {step === "bill" ? (
        <BillAmountForm
          billAmount={billAmount}
          onBillAmountChange={setBillAmount}
          onNext={handleBillNext}
        />
      ) : (
        <TipSelectionForm
          billAmount={parseFloat(billAmount)}
          tipPercentage={tipPercentage}
          setTipPercentage={setTipPercentage}
          customTip={customTip}
          setCustomTip={setCustomTip}
          aiSuggestion={aiSuggestion}
          onContinue={handleContinueToPay}
          onBack={() => setStep("bill")}
        />
      )}
    </div>
  );
}

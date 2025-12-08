"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { getMerchant, type Merchant } from "@/lib/api";
import { BillAmountForm } from "./bill-amount-form";
import { TipSelectionForm } from "./tip-selection-form";
import { cn } from "@/lib/utils";

// Demo merchant for testing when backend is unavailable
const DEMO_MERCHANT: Merchant = {
  id: "merchant_demo_cafe",
  name: "Demo Cafe",
  logo: "/user.webp",
  address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
};

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
      setIsDataLoading(true);
      
      // Generate a session ID if not present
      const currentSession =
        searchParams.get("session") || `session_${Date.now()}`;
      setSessionId(currentSession);

      // Try to fetch merchant from API, fall back to demo merchant
      try {
        const m = await getMerchant(merchantId);
        // Handle wrapped response: { success: true, data: {...} }
        if (m && typeof m === 'object' && 'data' in m) {
          setMerchant((m as any).data);
        } else {
          setMerchant(m);
        }
      } catch (e) {
        console.warn("API unavailable, using demo merchant for testing", e);
        setMerchant(DEMO_MERCHANT);
      }

      // Try to get merchant payTo address and memo
      if (merchant) {
        setPayTo(merchant.address || DEMO_MERCHANT.address);
        setMemo(`Tink-${Date.now().toString().slice(-6)}`);
      } else {
        // Use demo values for testing
        setPayTo(DEMO_MERCHANT.address);
        setMemo(`Tink-${Date.now().toString().slice(-6)}`);
      }

      setIsDataLoading(false);
    }
    loadData();
  }, [merchantId, searchParams]);

  const handleBillNext = async () => {
    if (billAmount && !isNaN(parseFloat(billAmount))) {
      setIsDataLoading(true);

      // Use default 15% AI suggestion for demo
      // In production, this would call the AI suggestion endpoint
      setAiSuggestion(15);
      setTipPercentage(15);

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

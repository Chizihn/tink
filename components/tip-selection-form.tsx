"use client";

import * as React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TipSelectionFormProps {
  billAmount: number;
  tipPercentage: number | null;
  setTipPercentage: (value: number | null) => void;
  customTip: string;
  setCustomTip: (value: string) => void;
  aiSuggestion: number | null;
  onContinue: () => void;
  onBack: () => void;
}

const TIP_OPTIONS = [10, 15, 20];

export function TipSelectionForm({
  billAmount,
  tipPercentage,
  setTipPercentage,
  customTip,
  setCustomTip,
  aiSuggestion,
  onContinue,
  onBack,
}: TipSelectionFormProps) {
  const calculateTotal = () => {
    const bill = billAmount || 0;
    let tip = 0;
    if (customTip) {
      tip = parseFloat(customTip) || 0;
    } else if (tipPercentage) {
      tip = bill * (tipPercentage / 100);
    }
    return (bill + tip).toFixed(2);
  };

  const handleRoundUp = () => {
    const bill = billAmount || 0;
    const roundedTotal = Math.ceil(bill);
    const tip = roundedTotal - bill > 0 ? roundedTotal - bill : 1.0; // If exact, add $1
    setCustomTip(tip.toFixed(2));
    setTipPercentage(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      <div className="rounded-xl bg-white/5 p-4 text-center">
        <p className="text-sm text-muted-foreground">Bill Amount</p>
        <div className="text-4xl font-bold text-white">
          ${billAmount.toFixed(2)}
        </div>
      </div>

      {aiSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="flex items-center gap-2 rounded-full bg-[#E84142]/10 px-4 py-1.5 text-sm font-medium text-[#E84142] ring-1 ring-[#E84142]/20">
            <Sparkles className="h-4 w-4" />
            AI Suggestion: {aiSuggestion}%
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-4 gap-3">
        <Button
          variant="outline"
          className={cn(
            "h-14 text-sm font-medium transition-all hover:scale-105",
             !tipPercentage && customTip && (parseFloat(customTip) + billAmount) % 1 === 0
                ? "bg-[#E84142] text-white hover:bg-[#E84142]/90"
                : "border-white/10 bg-white/5 hover:bg-white/10"
          )}
          onClick={handleRoundUp}
        >
          Round Up
        </Button>
        {TIP_OPTIONS.map((pct) => (
          <Button
            key={pct}
            variant={
              tipPercentage === pct && !customTip ? "default" : "outline"
            }
            className={cn(
              "h-14 text-lg font-medium transition-all hover:scale-105",
              tipPercentage === pct && !customTip
                ? "bg-[#E84142] text-white hover:bg-[#E84142]/90"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            )}
            onClick={() => {
              setTipPercentage(pct);
              setCustomTip("");
            }}
          >
            {pct}%
          </Button>
        ))}
      </div>
      <Input
        type="number"
        placeholder="Enter Custom Tip Amount"
        value={customTip}
        onChange={(e) => {
          setCustomTip(e.target.value);
          setTipPercentage(null);
        }}
        className="h-14 text-center text-lg"
      />

      <div className="rounded-xl bg-black/40 p-4 text-center">
        <p className="text-sm text-muted-foreground">Total Payable</p>
        <div className="text-4xl font-bold text-white">${calculateTotal()}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="lg"
          className="border-white/10 bg-white/5 hover:bg-white/10"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          size="lg"
          className="bg-[#E84142] text-lg font-bold hover:bg-[#E84142]/90"
          onClick={onContinue}
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}

"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BillAmountFormProps {
  billAmount: string;
  onBillAmountChange: (value: string) => void;
  onNext: () => void;
}

export function BillAmountForm({
  billAmount,
  onBillAmountChange,
  onNext,
}: BillAmountFormProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Card className="glass-card w-full border-none bg-black/40">
      <CardHeader>
        <CardTitle className="text-center text-lg font-medium">
          Enter Bill Amount
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
            $
          </span>
          <Input
            ref={inputRef}
            type="number"
            placeholder="0.00"
            value={billAmount}
            onChange={(e) => onBillAmountChange(e.target.value)}
            className="h-16 pl-10 text-center text-3xl font-bold tracking-wider"
          />
        </div>
        <Button
          size="lg"
          className="w-full"
          onClick={onNext}
          disabled={!billAmount || parseFloat(billAmount) <= 0}
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

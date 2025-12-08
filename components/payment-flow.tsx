"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useAccount,
  useSignTypedData,
  useWalletClient
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { preparePayment, settlePayment } from "@/lib/api";
import { normalizeSignatureV } from "@/lib/x402";

export function PaymentFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConnected, address: userAddress } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  
  // Local state
  const [isProcessing, setIsProcessing] = React.useState(false);

  const merchantId = searchParams.get("merchant");
  const totalAmount = searchParams.get("total") || "0.00";
  const tipAmount = searchParams.get("tip") || "0.00";
  const billAmount = searchParams.get("bill") || "0.00";
  const session = searchParams.get("session") || "";
  const memo = searchParams.get("memo") || "";
  // payTo logic moved to backend prepare

  const handlePay = async () => {
    if (!isConnected || !userAddress || !session) return;

    setIsProcessing(true);
    try {
      // 1. Prepare Payment (Get info from backend)
      // This maps to "Prepare x402 payment"
      const resource = await preparePayment(session);
      const { payment } = resource;

      // 2. Construct Authorization (EIP-3009)
      // We need validAfter/validBefore/nonce. 
      // If the backend doesn't provide them, we generate them.
      // Ideally backend provides a nonce to prevent replay.
      // Let's assume we casually generate nonce if not in payment object.
      
      const nonce = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
        
      const validAfter = Math.floor(Date.now() / 1000);
      const validBefore = validAfter + 3600; // 1 hour

      const domain = {
        name: "USD Coin", // Or what the accepted token is
        version: "2",
        chainId: 43113, // Avalanche Fuji
        verifyingContract: payment.token_mint as `0x${string}`,
      } as const;

       const types = {
          TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
          ],
        } as const;

        const value = BigInt(Math.floor(payment.amount * 1000000)); // USDC 6 decimals

        const authorization = {
            from: userAddress,
            to: payment.pay_to as `0x${string}`,
            value: value,
            validAfter: BigInt(validAfter),
            validBefore: BigInt(validBefore),
            nonce: nonce as `0x${string}`,
        };

        // 3. Sign Typed Data
        console.log("Signing authorization...");
        toast.info("Please sign the payment authorization");
        
        const signature = await signTypedDataAsync({
            domain,
            types,
            primaryType: "TransferWithAuthorization",
            message: authorization
        });

        const normalizedSig = normalizeSignatureV(signature, 43113);

        // 4. Settle on-chain via Backend
        console.log("Settling payment...");
        const result = await settlePayment(session, normalizedSig, {
            ...authorization,
            value: authorization.value.toString(),
            validAfter: authorization.validAfter.toString(),
            validBefore: authorization.validBefore.toString()
        });
        
        if (result.status === "confirmed") {
             confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
             });

             toast.success("Payment Successful!");
             
             // 5. Redirect to Receipt
             setTimeout(() => {
                router.push(
                  `/receipt?session=${session}&tx=${result.receipt_id || "confirmed"}&total=${totalAmount}&tip=${tipAmount}`
                );
             }, 1500);
        } else {
             throw new Error("Payment settlement failed: " + result.status);
        }

    } catch (error: any) {
      console.error(error);
      if (error.cause?.code === 4001) { // User rejected
         toast.error("Transaction rejected");
      } else {
         toast.error("Payment Failed", { description: error.message });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Payment</h1>
        <p className="text-muted-foreground">Review and confirm your tip</p>
      </div>

      <Card className="glass-card border-none bg-black/40">
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>
            Please review the details below before proceeding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bill Amount</span>
              <span>${billAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tip Amount</span>
              <span className="text-avalanche-red font-medium">
                ${tipAmount}
              </span>
            </div>
            {memo && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Memo</span>
                <span className="font-medium text-white">
                  {memo}
                </span>
              </div>
            )}
            <Separator className="bg-white/10" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${totalAmount} USDC</span>
            </div>
          </div>

          <div className="rounded-lg bg-white/5 p-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>From</span>
              <span className="font-mono">
                {userAddress
                  ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
                  : "Your Wallet"}
              </span>
            </div>
          </div>

          {!isConnected ? (
            <div className="flex flex-col gap-2">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== "loading";
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === "authenticated");

                  return (
                    <div
                      {...(!ready && {
                        "aria-hidden": true,
                        style: {
                          opacity: 0,
                          pointerEvents: "none",
                          userSelect: "none",
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <Button
                              onClick={openConnectModal}
                              size="lg"
                              className="w-full bg-avalanche-red hover:bg-avalanche-red/90"
                            >
                              Connect Wallet
                            </Button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full bg-avalanche-red hover:bg-avalanche-red/90"
              onClick={handlePay}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay with Avalanche
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


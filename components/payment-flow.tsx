"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseEther } from "viem";
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
import { verifyPayment } from "@/lib/api";

export function PaymentFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConnected, address: userAddress } = useAccount();
  const { data: hash, sendTransaction, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const merchantId = searchParams.get("merchant") || "demo-cafe";
  const totalAmount = searchParams.get("total") || "0.00";
  const tipAmount = searchParams.get("tip") || "0.00";
  const billAmount = searchParams.get("bill") || "0.00";
  const session = searchParams.get("session") || "";
  const payTo = searchParams.get("payTo") || "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // Default or from API
  const memo = searchParams.get("memo") || "";

  React.useEffect(() => {
    async function handleSuccess() {
      if (isConfirmed && hash) {
        try {
          // Verify payment with backend
          if (session) {
             await verifyPayment(session, hash);
          }
          
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });

          toast.success("Payment Successful!", {
            description: "Your tip has been sent on Avalanche.",
          });

          setTimeout(() => {
            router.push(
              `/receipt?session=${session || Date.now()}&tx=${hash}&total=${totalAmount}&tip=${tipAmount}`
            );
          }, 1500);
        } catch (error) {
          console.error("Verification failed", error);
          toast.error("Verification Failed", {
            description: "Payment confirmed on chain, but backend verification failed.",
          });
          // Still redirect to receipt? Maybe with a warning.
           setTimeout(() => {
            router.push(
              `/receipt?session=${session || Date.now()}&tx=${hash}&total=${totalAmount}&tip=${tipAmount}&verified=false`
            );
          }, 1500);
        }
      }
    }
    handleSuccess();
  }, [isConfirmed, hash, router, totalAmount, tipAmount, session]);

  const handlePay = async () => {
    if (!isConnected || !userAddress) return;

    try {
      sendTransaction({
        to: payTo as `0x${string}`,
        value: parseEther(totalAmount),
      });
    } catch (error) {
      console.error(error);
      toast.error("Payment Failed", {
        description: "Please try again.",
      });
    } finally {
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
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>To</span>
              <span className="font-mono">{merchantId}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Recipient Address</span>
              <span className="font-mono">{payTo.slice(0, 6)}...{payTo.slice(-4)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Network</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Avalanche Fuji C-Chain
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
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? (
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


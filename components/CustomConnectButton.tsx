"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown } from "lucide-react";
import { useAccount } from "wagmi";
import Image from "next/image";

export function CustomConnectButton() {
  const { isConnected } = useAccount();

  return (
    <RainbowConnectButton.Custom>
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
          (!authenticationStatus || authenticationStatus === "authenticated");

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
                    variant="default"
                    size="lg"
                    className="font-semibold rounded-full"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} variant="destructive">
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <div
                    className="hidden md:flex items-center px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-sm font-medium cursor-pointer text-white hover:bg-secondary transition-colors"
                    onClick={openChainModal}
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          overflow: "hidden",
                          marginRight: 8,
                          color: "#fff",
                        }}
                      >
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            width={18}
                            height={18}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                    <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                  </div>

                  <Button
                    onClick={openAccountModal}
                    variant="secondary"
                    className={` transition-all ${
                      isConnected ? "bg-secondary" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {account.displayBalance &&
                      !account.displayBalance.includes("NaN") ? (
                        <span className="hidden sm:inline-block text-muted-foreground mr-1">
                          {account.displayBalance}
                        </span>
                      ) : null}
                      <span className="font-semibold">
                        {account.displayName}
                      </span>
                      {isConnected && (
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      )}
                    </div>
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}

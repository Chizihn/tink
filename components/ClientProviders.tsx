"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/sonner";
import { SnowParticles } from "@/components/snow-particles";

const Providers = dynamic(
  () => import("@/components/providers").then((mod) => mod.Providers),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Suspense>
        <SnowParticles />
      </Suspense>
      {children}
      <Toaster />
    </Providers>
  );
}

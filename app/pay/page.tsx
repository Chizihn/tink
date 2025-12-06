import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PaymentFlow } from "@/components/payment-flow";

export const metadata: Metadata = {
  title: "Complete Payment | Tink Protocol",
  description: "Complete your tip payment securely on Avalanche",
};

export default function PayPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-black/50">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-24">
        <PaymentFlow />
      </main>
      <Footer />
    </div>
  );
}

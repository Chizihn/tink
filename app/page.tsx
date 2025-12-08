import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TipEntryForm } from "@/components/tip-entry-form";

export const metadata: Metadata = {
  title: "Tip Now | Tink Protocol",
  description: "Send AI-powered tips instantly on Avalanche blockchain",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-background to-black/ ৫০">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <TipEntryForm />
      </main>
      <Footer />
    </div>
  );
}

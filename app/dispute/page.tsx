import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DisputeForm } from "@/components/dispute-form";

export const metadata: Metadata = {
  title: "Dispute Resolution | Tink Protocol",
  description: "Submit and manage tip disputes on Tink Protocol",
};

export default function DisputePage() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-background to-black/50">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-24">
        <DisputeForm />
      </main>
      <Footer />
    </div>
  );
}

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ReceiptView } from "@/components/receipt-view";

export default function ReceiptPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-black/50">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-24">
        <ReceiptView />
      </main>
      <Footer />
    </div>
  );
}

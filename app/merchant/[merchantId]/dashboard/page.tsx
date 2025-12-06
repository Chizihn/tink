import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MerchantDashboard } from "@/components/merchant-dashboard";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-background to-black/50">
      <Header />
      <main className="flex flex-1 flex-col p-4 md:p-8">
        <MerchantDashboard />
      </main>
      <Footer />
    </div>
  );
}

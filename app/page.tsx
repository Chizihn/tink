import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TipEntryForm } from "@/components/tip-entry-form";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-background to-black/50">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <TipEntryForm />
      </main>
      <Footer />
    </div>
  );
}

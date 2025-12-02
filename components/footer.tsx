export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black/20 py-6 backdrop-blur-md">
      <div className=" flex flex-col items-center justify-center gap-4 px-4 text-center md:px-6">
        <p className="text-sm text-muted-foreground">
          Powered by{" "}
          <span className="font-semibold text-[#E84142]">Tink Protocol</span> on
          Avalanche for the x402 Hackathon
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
          <span>Avalanche L1</span>
          <span>•</span>
          <span>x402 Verified</span>
        </div>
      </div>
    </footer>
  );
}

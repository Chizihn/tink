"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomConnectButton } from "./CustomConnectButton";

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/widget", label: "Widget" },
    { href: "/docs", label: "Docs" },
    { href: "/merchant/demo-cafe/dashboard", label: "Dashboard" },
    { href: "/dispute", label: "Disputes" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E84142]">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="hidden text-lg font-bold tracking-tight text-white sm:inline-block">
              Tink Protocol
            </span>
          </Link>
        </div>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                pathname?.startsWith(link.href)
                  ? "text-white"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-4">
          <CustomConnectButton />
        </div>
      </div>
    </header>
  );
}

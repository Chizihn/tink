import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | Tink Protocol",
  description: "Learn how to integrate and use Tink Protocol for AI-powered tipping",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Widget Integration | Tink Protocol",
  description: "Integrate AI-powered tipping into your application with the Tink Widget",
};

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

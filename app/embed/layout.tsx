import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Embed Widget | Tink Protocol",
  description: "Embeddable tip widget for external websites",
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

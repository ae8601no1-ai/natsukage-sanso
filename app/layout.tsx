import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "夏影山荘",
  description: "記憶と記録の矛盾をたどる、日本語分岐型サスペンスARG。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}

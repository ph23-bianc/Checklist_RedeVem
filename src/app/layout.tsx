import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Check List Lojas - RedeVem",
  description: "Sistema de checklist operacional para lojas RedeVem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50">{children}</body>
    </html>
  );
}

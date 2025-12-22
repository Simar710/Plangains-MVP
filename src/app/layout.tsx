import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "PlanGains | Creator-first fitness platform",
  description: "Launch and monetize your training programs with PlanGains."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <SiteHeader />
        <main className="min-h-screen bg-background">{children}</main>
      </body>
    </html>
  );
}

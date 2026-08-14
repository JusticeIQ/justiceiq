import type { Metadata } from "next";
import "./globals.css";
import { AppStateProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "SolonIQ™ — Qualified legal opportunities. Structured case intelligence.",
  description:
    "SolonIQ is the professional law-firm portal connected to JusticeChamp Consumer Intake — referral management, case management, and legal-business intelligence in one platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}

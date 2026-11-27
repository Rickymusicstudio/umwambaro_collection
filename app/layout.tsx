import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Cormorant_Garamond } from "next/font/google";

import "./globals.css";

// Elegant serif used for the UMWAMBARO wordmark.
const display = Cormorant_Garamond({ weight: "600", subsets: ["latin"], variable: "--font-display", display: "swap" });

import { CartProvider } from "@/context/CartContext";
import StoreChrome from "@/components/store/StoreChrome";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: `${siteConfig.fullName} · ${siteConfig.tagline}`,
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.fullName} · ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.fullName,
    type: "website",
    locale: "en_RW",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f3b3e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={display.variable}>
      <body className="min-h-screen bg-[var(--um-page)] text-neutral-900 antialiased">
        <CartProvider>
          <StoreChrome>{children}</StoreChrome>
        </CartProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { CartProvider } from "@/context/CartContext";
import StoreChrome from "@/components/store/StoreChrome";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: `${siteConfig.fullName} · ${siteConfig.tagline}`,
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: "#0f3b3e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--um-page)] text-neutral-900 antialiased">
        <CartProvider>
          <StoreChrome>{children}</StoreChrome>
        </CartProvider>
      </body>
    </html>
  );
}

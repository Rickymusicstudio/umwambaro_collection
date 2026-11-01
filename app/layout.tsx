import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { CartProvider } from "@/context/CartContext";
import StoreChrome from "@/components/store/StoreChrome";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: `${siteConfig.fullName} · ${siteConfig.tagline}`,
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: "#2b1810",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f3e9dc] text-neutral-900 antialiased">
        <CartProvider>
          <StoreChrome>{children}</StoreChrome>
        </CartProvider>
      </body>
    </html>
  );
}

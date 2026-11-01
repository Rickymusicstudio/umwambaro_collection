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
  themeColor: "#131921",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#eaeded] text-neutral-900 antialiased">
        <CartProvider>
          <StoreChrome>{children}</StoreChrome>
        </CartProvider>
      </body>
    </html>
  );
}

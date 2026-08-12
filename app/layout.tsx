import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Umwambaro Collections",
  description:
    "Luxury African fashion crafted with elegance and authenticity.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <CartProvider>

          <Header />

          <main className="min-h-screen">
            {children}
          </main>

          <Footer />

        </CartProvider>
      </body>
    </html>
  );
}
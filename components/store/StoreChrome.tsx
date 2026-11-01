"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

// Shop header/footer/bottom bar everywhere except the admin area.
export default function StoreChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <div id="top" />
      <Suspense fallback={<div className="h-[104px] bg-[#2b1810]" />}>
        <Header />
      </Suspense>
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <BottomNav />
    </>
  );
}

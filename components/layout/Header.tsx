"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Logo from "@/components/shared/Logo";
import Container from "@/components/layout/Container";
import CartDrawer from "@/components/cart/CartDrawer";
import { useCart } from "@/context/CartContext";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Women", href: "/shop?category=Women" },
  { label: "Men", href: "/shop?category=Men" },
  { label: "Accessories", href: "/shop?category=Accessories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { totalItems } = useCart();

  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = query.trim();
    router.push(value ? `/shop?q=${encodeURIComponent(value)}` : "/shop");
    setMobileOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#ead9c0] bg-[#fffaf3]/95 shadow-sm backdrop-blur">
        <div className="bg-gradient-to-r from-[#6f1d1b] via-[#a44a2f] to-[#c8a27a] text-white">
          <Container>
            <div className="flex h-9 items-center justify-center text-[11px] font-semibold tracking-[0.08em] sm:text-xs">
              <span>CRAFTED IN RWANDA</span>
              <span className="mx-2 opacity-50 sm:mx-3">•</span>
              <span className="hidden sm:inline">DELIVERY ACROSS RWANDA</span>
              <span className="mx-2 opacity-50 sm:mx-3">•</span>
              <span>NEW &amp; CHAGUWA FINDS</span>
            </div>
          </Container>
        </div>
        <Container>
          <div className="flex min-h-24 items-center gap-5 lg:gap-8">
            <button type="button" onClick={() => setMobileOpen((v) => !v)} className="lg:hidden" aria-label="Open menu">{mobileOpen ? <X size={25} /> : <Menu size={25} />}</button>
            <div className="shrink-0"><Logo /></div>

            <form onSubmit={search} className="hidden flex-1 lg:flex">
              <div className="flex h-14 w-full overflow-hidden rounded-2xl border border-[#ead9c0] bg-white shadow-sm focus-within:border-[#c8a27a]">
                <div className="flex flex-1 items-center px-5"><Search size={21} className="mr-3 text-gray-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search dresses, blazers, shoes, accessories..." className="w-full bg-transparent text-[16px] outline-none placeholder:text-gray-400" /></div>
                <button type="submit" className="flex w-24 items-center justify-center bg-[#a44a2f] text-white transition hover:bg-[#7f3322]"><Search size={21} /></button>
              </div>
            </form>

            <div className="ml-auto flex items-center gap-4 sm:gap-5">
              <Link href="/account" className="hidden flex-col items-center text-sm transition hover:text-[#c8a27a] md:flex"><User size={22} /><span>Account</span></Link>
              <Link href="/account" className="hidden sm:block" aria-label="Wishlist"><Heart size={23} /></Link>
              <button type="button" onClick={() => setCartOpen(true)} className="relative" aria-label="Open cart"><ShoppingCart size={23} />{totalItems > 0 && <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#c8a27a] text-xs font-semibold text-white">{totalItems}</span>}</button>
            </div>
          </div>

          <nav className="hidden border-t border-[#ead9c0] bg-[#fffdf9] lg:block"><div className="flex items-center justify-center gap-10 py-4">{navigation.map((item) => <Link key={item.label} href={item.href} className="text-sm font-medium uppercase tracking-wider transition hover:text-[#c8a27a]">{item.label}</Link>)}</div></nav>

          {mobileOpen && (
            <div className="border-t py-4 lg:hidden">
              <form onSubmit={search} className="mb-3 flex h-12 overflow-hidden rounded-xl border border-gray-200"><input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search products..." className="min-w-0 flex-1 px-4 outline-none" /><button type="submit" className="w-14 bg-[#c8a27a] text-white"><Search size={19} className="mx-auto" /></button></form>
              <nav className="flex flex-col">{navigation.map((item) => <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 font-medium transition hover:bg-[#fff1dc] hover:text-[#9a3412]">{item.label}</Link>)}</nav>
              <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-4"><Link href="/account" onClick={() => setMobileOpen(false)} className="rounded-xl bg-neutral-100 px-4 py-3 text-center font-medium">Account</Link><button type="button" onClick={() => { setMobileOpen(false); setCartOpen(true); }} className="rounded-xl bg-black px-4 py-3 font-medium text-white">Cart ({totalItems})</button></div>
            </div>
          )}
        </Container>
      </header>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingCart, User, MapPin } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { shopCategories } from "@/constants/site";

const quickLinks = [
  { label: "All", href: "/shop" },
  ...shopCategories.map((c) => ({ label: c.name, href: `/shop?category=${encodeURIComponent(c.name)}` })),
  { label: "New", href: "/shop?condition=new" },
  { label: "Chaguwa", href: "/shop?condition=chaguwa" },
  { label: "Deals", href: "/shop?sale=true" },
  { label: "Track order", href: "/track" },
];

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 flex-col leading-none text-white" aria-label="UMWAMBARO home">
      <span className={`${small ? "text-lg" : "text-xl sm:text-2xl"} font-extrabold tracking-tight`}>
        UMWAMBARO
      </span>
      <span className="mt-0.5 h-1 w-full rounded-full bg-[#ff9900]" />
    </Link>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { totalItems } = useCart();
  const [query, setQuery] = useState(params.get("q") ?? "");

  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  const current = pathname + (params.toString() ? `?${params.toString()}` : "");

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-[#131921] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:flex-nowrap sm:gap-4 sm:px-4">
          <Logo />

          <div className="hidden items-center gap-1 text-xs leading-tight text-neutral-300 lg:flex">
            <MapPin size={18} className="text-white" />
            <span>Deliver to<br /><strong className="text-sm text-white">All Rwanda</strong></span>
          </div>

          {/* search: full width on phones (second row) */}
          <form onSubmit={search} role="search" className="order-last flex h-11 w-full overflow-hidden rounded-lg bg-white sm:order-none sm:flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dresses, shoes, shirts…"
              aria-label="Search products"
              className="min-w-0 flex-1 px-3 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-500"
            />
            <button type="submit" aria-label="Search" className="grid w-12 place-items-center bg-[#febd69] text-[#131921] hover:bg-[#f3a847]">
              <Search size={22} />
            </button>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:ml-0">
            <Link href="/account" className="hidden flex-col rounded px-2 py-1 text-xs leading-tight hover:outline hover:outline-1 hover:outline-white sm:flex">
              <span className="text-neutral-300">Hello, sign in</span>
              <strong className="text-sm">Account</strong>
            </Link>
            <Link href="/account" aria-label="Account" className="grid h-10 w-10 place-items-center sm:hidden">
              <User size={24} />
            </Link>
            <Link href="/cart" aria-label={`Cart, ${totalItems} items`} className="relative flex items-end gap-1 rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-white">
              <ShoppingCart size={30} />
              <span className="absolute left-[18px] top-0 min-w-5 rounded-full bg-[#ff9900] px-1 text-center text-xs font-bold text-[#131921]">
                {totalItems}
              </span>
              <strong className="hidden text-sm sm:inline">Cart</strong>
            </Link>
          </div>
        </div>
      </div>

      {/* category strip – swipe on phones */}
      <nav aria-label="Categories" className="bg-[#232f3e] text-white">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 py-1.5 sm:px-4">
          {quickLinks.map((l) => {
            const active = current === l.href || (l.href === "/shop" && current === "/shop");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium ${
                  active ? "bg-white text-[#131921]" : "hover:outline hover:outline-1 hover:outline-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

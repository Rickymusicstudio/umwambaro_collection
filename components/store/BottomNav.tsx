"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

// Phone-only bottom bar: the 4 things people need, always one tap away.
export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const items = [
    { href: "/", label: "Home", icon: Home, active: pathname === "/" },
    { href: "/shop", label: "Shop", icon: LayoutGrid, active: pathname.startsWith("/shop") },
    { href: "/cart", label: "Cart", icon: ShoppingCart, active: pathname === "/cart" || pathname.startsWith("/checkout"), badge: totalItems },
    { href: "/account", label: "Account", icon: User, active: pathname.startsWith("/account") || pathname === "/track" },
  ];
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden">
      {items.map(({ href, label, icon: Icon, active, badge }) => (
        <Link key={href} href={href} className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${active ? "text-[#9e2a1f]" : "text-neutral-600"}`}>
          <Icon size={22} />
          {label}
          {!!badge && <span className="absolute left-1/2 top-1 ml-2 min-w-5 rounded-full bg-[#c8a27a] px-1 text-center text-[11px] font-bold text-[#2b1810]">{badge}</span>}
        </Link>
      ))}
    </nav>
  );
}

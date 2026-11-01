"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LayoutDashboard, Package, ShoppingBag, Users, Settings } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[var(--um-page)] text-neutral-900">
        <div className="flex min-h-screen">
          {/* computer: sidebar */}
          <aside className="hidden w-60 shrink-0 bg-[var(--um-dark)] text-white lg:block">
            <div className="sticky top-0 flex h-screen flex-col p-4">
              <Link href="/admin" className="px-2 pb-4">
                <span className="block text-xl font-extrabold">UMWAMBARO</span>
                <span className="mt-0.5 block h-1 w-full rounded-full bg-[var(--um-accent)]" />
                <span className="mt-2 block text-xs font-semibold uppercase tracking-wider text-[var(--um-accent-light)]">Seller admin</span>
              </Link>
              <nav className="mt-4 space-y-1">
                {links.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive(href) ? "bg-[var(--um-accent)] text-[var(--um-dark)]" : "text-neutral-300 hover:bg-white/10 hover:text-white"}`}>
                    <Icon size={18} /> {label}
                  </Link>
                ))}
              </nav>
              <Link href="/" target="_blank" className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/10 hover:text-white">
                <ArrowLeft size={18} /> View store
              </Link>
            </div>
          </aside>

          <main className="min-w-0 flex-1 pb-20 lg:pb-0">
            {/* phone: top bar */}
            <div className="flex items-center justify-between bg-[var(--um-dark)] px-4 py-3 text-white lg:hidden">
              <Link href="/admin" className="font-extrabold">UMWAMBARO <span className="text-[var(--um-accent-light)]">admin</span></Link>
              <Link href="/" target="_blank" className="text-sm text-neutral-300">View store</Link>
            </div>
            {children}
          </main>
        </div>

        {/* phone: bottom tabs */}
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${isActive(href) ? "text-[var(--um-strong)]" : "text-neutral-600"}`}>
              <Icon size={21} /> {label}
            </Link>
          ))}
        </nav>
      </div>
    </AdminGuard>
  );
}

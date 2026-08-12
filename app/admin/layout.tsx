"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LayoutDashboard, Package, ShoppingBag, Users, Settings, Sparkles } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#f7efe4] text-[#2a211f]">
        <div className="flex min-h-screen">
          <aside className="hidden w-64 shrink-0 bg-[#2a211f] text-white lg:block">
            <div className="sticky top-0 flex h-screen flex-col p-5">
              <Link href="/" className="border-b border-white/10 pb-5">
                <div className="text-2xl font-semibold tracking-[0.18em]">UMWAMBARO</div>
                <div className="mt-1 text-[10px] font-semibold tracking-[0.42em] text-[#e7bd63]">COLLECTIONS</div>
              </Link>

              <div className="mt-6 rounded-2xl border border-[#e7bd63]/20 bg-[#e7bd63]/10 p-4">
                <div className="flex items-center gap-2 text-[#f6d78e]">
                  <Sparkles size={14} />
                  <p className="text-xs font-semibold uppercase tracking-wider">Store Admin</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-white/60">Protected catalog management. Product writes are enforced by Supabase RLS.</p>
              </div>

              <nav className="mt-6 space-y-1">
                <AdminLink href="/admin" icon={<LayoutDashboard size={18} />}>Dashboard</AdminLink>
                <AdminLink href="/admin/orders" icon={<ShoppingBag size={18} />}>Orders</AdminLink>
                <AdminLink href="/admin/products" icon={<Package size={18} />}>Products</AdminLink>
                <AdminLink href="/admin/customers" icon={<Users size={18} />}>Customers</AdminLink>
                <AdminLink href="/admin/settings" icon={<Settings size={18} />}>Settings</AdminLink>
              </nav>

              <div className="mt-auto border-t border-white/10 pt-4">
                <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white">
                  <ArrowLeft size={18} /> Back to store
                </Link>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="border-b border-[#ead9c0] bg-[#fffaf3] px-4 py-4 shadow-sm lg:hidden">
              <div className="flex items-center justify-between">
                <Link href="/" className="font-semibold tracking-[0.14em]">UMWAMBARO</Link>
                <Link href="/admin" className="rounded-full bg-[#a44a2f] px-4 py-2 text-sm font-semibold text-white">Dashboard</Link>
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}

function AdminLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white">
      <span className="transition group-hover:text-[#e7bd63]">{icon}</span>
      {children}
    </Link>
  );
}

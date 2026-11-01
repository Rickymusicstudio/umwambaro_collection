"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DollarSign, Package, ShoppingBag, Clock3, ArrowRight } from "lucide-react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import Price from "@/components/ui/Price";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type DashboardOrder = { id: string; order_number: string; status: "pending" | "confirmed" | "delivered" | "cancelled"; total_amount: number; customer_name: string; customer_phone: string; created_at: string };

export default function AdminDashboard() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [toCollect, setToCollect] = useState(0);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { setLoading(false); return; }
      const [{ data: recent }, { count: totalOrders }, { count: totalProducts }, { data: revenueRows }, { count: pendingCount }] = await Promise.all([
        supabase.from("orders").select("id, order_number, status, total_amount, customer_name, customer_phone, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("orders").select("total_amount, status").neq("status", "cancelled"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setOrders((recent ?? []) as DashboardOrder[]);
      setOrderCount(totalOrders ?? 0);
      setProductCount(totalProducts ?? 0);
      const rows = (revenueRows ?? []) as { total_amount: number; status: string }[];
      // money is only "earned" once the order is delivered and paid
      setRevenue(rows.filter((r) => r.status === "delivered").reduce((sum, r) => sum + Number(r.total_amount ?? 0), 0));
      setToCollect(rows.filter((r) => r.status === "pending" || r.status === "confirmed").reduce((sum, r) => sum + Number(r.total_amount ?? 0), 0));
      setPending(pendingCount ?? 0);
      setLoading(false);
    }
    void load();
  }, []);

  const stats = useMemo(() => ({ revenue, pending, toCollect }), [revenue, pending, toCollect]);

  return (
    <>
      <AdminHeader title="Dashboard" description="A quick overview of your UMWAMBARO store." />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard label="Revenue (delivered)" value={loading ? "…" : formatRwf(stats.revenue)} hint={loading ? "" : `To collect: ${formatRwf(stats.toCollect)}`} icon={<DollarSign size={20} />} />
          <StatCard label="Orders" value={loading ? "…" : String(orderCount)} hint="All recorded orders" icon={<ShoppingBag size={20} />} />
          <StatCard label="New orders" value={loading ? "…" : String(stats.pending)} hint="Waiting for your call" icon={<Clock3 size={20} />} />
          <StatCard label="Products" value={loading ? "…" : String(productCount)} hint="Active catalog" icon={<Package size={20} />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-lg border border-[var(--um-line)] bg-[#ffffff] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--um-line)] p-5"><div><h2 className="font-semibold">Recent orders</h2><p className="mt-1 text-sm text-[var(--um-muted)]">Latest customer purchases from Supabase.</p></div><Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--um-dark2)]">View all <ArrowRight size={16} /></Link></div>
            {orders.length === 0 ? <div className="p-10 text-center text-sm text-[var(--um-muted)]">{loading ? "Loading orders…" : "No orders yet."}</div> : <div className="divide-y divide-[var(--um-line)]">{orders.map((order) => <div key={order.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{order.order_number}</p><p className="text-sm text-[var(--um-muted)]">{order.customer_name} · {order.customer_phone}</p></div><div className="flex items-center gap-4"><Price price={Number(order.total_amount)} size="sm" /><span className="rounded-full bg-[var(--um-soft)] px-2.5 py-1 text-xs font-semibold capitalize">{order.status}</span></div></div>)}</div>}
          </section>
          <section className="rounded-lg border border-[var(--um-line)] bg-[#ffffff] p-5 shadow-sm"><h2 className="font-semibold">Quick actions</h2><div className="mt-4 space-y-2"><Quick href="/admin/orders">Manage orders</Quick><Quick href="/admin/products">Manage products</Quick><Quick href="/admin/accounting">Accounting &amp; amadeni</Quick><Quick href="/shop">Open storefront</Quick></div></section>
        </div>
      </div>
    </>
  );
}

function Quick({ href, children }: { href: string; children: ReactNode }) { return <Link href={href} className="flex items-center justify-between rounded-xl border border-[var(--um-line)] bg-white p-4 text-sm font-semibold transition hover:bg-[#fffaf2]">{children}<ArrowRight size={16} /></Link>; }
function formatRwf(value: number) { return `RWF ${new Intl.NumberFormat("en-RW").format(value)}`; }

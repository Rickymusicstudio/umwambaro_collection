"use client";

import { useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Order = { status: string; total_amount: number; customer_name: string; customer_phone: string; district: string };

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { setError("Supabase is not configured."); return; }
      const { data, error: fetchError } = await supabase.from("orders").select("status, total_amount, customer_name, customer_phone, district").order("created_at", { ascending: false });
      if (fetchError) setError(fetchError.message);
      setOrders((data ?? []) as Order[]);
    }
    void load();
  }, []);

  const customers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; district: string; orders: number; total: number }>();
    orders.forEach((order) => {
      const key = order.customer_phone;
      const current = map.get(key) ?? { name: order.customer_name, phone: key, district: order.district, orders: 0, total: 0 };
      current.orders += 1;
      if (order.status !== "cancelled") current.total += Number(order.total_amount);
      map.set(key, current);
    });
    return Array.from(map.values());
  }, [orders]);

  return <><AdminHeader title="Customers" description="Customers are derived from store orders." /><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{error && <div className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}<div className="overflow-hidden rounded-lg border border-[#d5d9d9] bg-[#ffffff] shadow-sm">{customers.length === 0 ? <div className="p-12 text-center text-sm text-[#565959]">Customers will appear after the first order.</div> : customers.map((customer) => <div key={customer.phone} className="grid gap-3 border-b border-[#d5d9d9] p-5 last:border-0 sm:grid-cols-[1.5fr_1fr_1fr_120px] sm:items-center"><div><p className="font-semibold">{customer.name}</p><p className="text-sm text-[#565959]">{customer.phone}</p></div><div className="text-sm text-[#565959]">{customer.district}</div><div className="text-sm text-[#565959]">{customer.orders} order{customer.orders === 1 ? "" : "s"}</div><div className="text-sm font-semibold sm:text-right">{new Intl.NumberFormat("en-RW").format(customer.total)} RWF</div></div>)}</div></div></>;
}

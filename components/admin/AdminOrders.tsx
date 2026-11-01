"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import Price from "@/components/ui/Price";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";
type OrderRow = {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_address: string;
  district: string;
  sector: string | null;
  cell: string | null;
  delivery_notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
};
type ItemRow = { id: string; order_id: string; product_name: string; sku: string | null; price: number; quantity: number; color: string | null; size: string | null };
const statuses: OrderStatus[] = ["pending", "confirmed", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  async function load(showSpinner = true) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }
    if (showSpinner) setLoading(true);
    else setRefreshing(true);
    setError("");

    const [{ data: orderData, error: orderError }, { data: itemData, error: itemError }] = await Promise.all([
      supabase.from("orders").select("id, order_number, status, customer_name, customer_email, customer_phone, delivery_address, district, sector, cell, delivery_notes, subtotal, delivery_fee, total_amount, currency, payment_method, payment_status, created_at").order("created_at", { ascending: false }),
      supabase.from("order_items").select("id, order_id, product_name, sku, price, quantity, color, size").order("created_at", { ascending: true }),
    ]);

    if (orderError || itemError) setError(orderError?.message ?? itemError?.message ?? "Unable to load orders.");
    setOrders((orderData ?? []) as OrderRow[]);
    setItems((itemData ?? []) as ItemRow[]);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => orders.filter((order) => {
    const q = query.trim().toLowerCase();
    const haystack = [order.order_number, order.customer_name, order.customer_phone, order.customer_email ?? "", order.district, order.sector ?? "", order.delivery_address].join(" ").toLowerCase();
    return (!q || haystack.includes(q)) && (status === "all" || order.status === status);
  }), [orders, query, status]);

  async function updateStatus(id: string, nextStatus: OrderStatus) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    if (nextStatus === "cancelled" && !window.confirm("Cancel this order? Its items will go back in stock.")) return;
    setError("");
    const { error } = await supabase.from("orders").update({ status: nextStatus }).eq("id", id);
    if (error) { setError(error.message); return; }
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status: nextStatus } : order));
  }

  function orderItems(orderId: string) {
    return items.filter((item) => item.order_id === orderId);
  }

  return (
    <div className="rounded-lg border border-[#e3d5c3] bg-[#ffffff] shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#e3d5c3] p-5 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6f7373]" size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order, customer, phone or district..." className="h-11 w-full rounded-xl border border-[#bfae98] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#b3261e]" /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value as "all" | OrderStatus)} className="h-11 rounded-xl border border-[#bfae98] bg-white px-4 text-sm outline-none focus:border-[#b3261e]"><option value="all">All statuses</option>{statuses.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select>
      </div>

      <div className="flex items-center justify-between border-b border-[#e3d5c3] px-5 py-3 text-xs text-[#6b5a4e]">
        <span>Showing {filtered.length} of {orders.length} orders</span>
        <button type="button" onClick={() => void load(false)} disabled={refreshing} className="inline-flex items-center gap-2 font-semibold text-[#4a2c1d] disabled:opacity-50"><RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh</button>
      </div>

      {error && <div className="m-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {loading ? <div className="p-12 text-center text-sm text-[#6b5a4e]">Loading orders…</div> : filtered.length === 0 ? <div className="p-12 text-center"><ShoppingBag className="mx-auto text-[#c7cbcb]" size={40} /><h3 className="mt-4 font-semibold">No orders found</h3><p className="mt-1 text-sm text-[#6b5a4e]">Orders placed through checkout will appear here.</p></div> : <div className="divide-y divide-[#e3d5c3]">
        {filtered.map((order) => {
          const isOpen = expanded[order.id] ?? false;
          const orderItemRows = orderItems(order.id);
          return <div key={order.id} className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{order.order_number}</span><StatusBadge status={order.status} /><span className="rounded-full bg-[#f7efe4] px-2.5 py-1 text-xs font-semibold capitalize">{order.payment_method.replaceAll("_", " ")}</span></div>
                <p className="mt-2 text-sm font-medium">{order.customer_name} <span className="font-normal text-[#6b5a4e]">· <a href={`tel:+${order.customer_phone.replace(/\D/g, "")}`} className="font-semibold text-[#6b3e26] hover:underline">{order.customer_phone}</a></span></p>
                {order.customer_email && <p className="mt-1 text-xs text-[#6b5a4e]">{order.customer_email}</p>}
                <p className="mt-1 text-xs text-[#6b5a4e]">{order.district}{order.sector ? ` · ${order.sector}` : ""}{order.cell ? ` · ${order.cell}` : ""} · {new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center"><Price price={Number(order.total_amount)} size="sm" /><select aria-label={`Update ${order.order_number} status`} value={order.status} onChange={(e) => void updateStatus(order.id, e.target.value as OrderStatus)} className="h-10 rounded-lg border border-[#bfae98] bg-white px-3 text-sm font-medium outline-none focus:border-[#b3261e]">{statuses.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select><button type="button" onClick={() => setExpanded((current) => ({ ...current, [order.id]: !isOpen }))} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#bfae98] bg-white px-3 text-sm font-semibold">{isOpen ? "Hide details" : "View details"}{isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button></div>
            </div>

            {isOpen && <div className="mt-4 grid gap-5 border-t border-[#e3d5c3] pt-4 lg:grid-cols-[1fr_320px]">
              <div><h4 className="text-sm font-semibold">Items</h4><div className="mt-3 grid gap-2 sm:grid-cols-2">{orderItemRows.map((item) => <div key={item.id} className="rounded-xl bg-[#f3e9dc] p-3"><p className="font-medium">{item.product_name}</p><p className="mt-1 text-xs text-[#6b5a4e]">Qty {item.quantity}{item.size ? ` · ${item.size}` : ""}{item.color ? ` · ${item.color}` : ""}</p><p className="mt-1 text-xs font-semibold">{new Intl.NumberFormat("en-RW").format(Number(item.price) * item.quantity)} RWF</p></div>)}</div></div>
              <div className="rounded-xl border border-[#e3d5c3] bg-white p-4 text-sm"><p className="font-semibold">Delivery</p><p className="mt-2 text-[#6b5a4e]">{order.delivery_address}</p>{order.delivery_notes && <p className="mt-2 text-[#6b5a4e]">Note: {order.delivery_notes}</p>}<div className="mt-4 border-t border-[#e3d5c3] pt-3"><div className="flex justify-between"><span>Subtotal</span><span>{new Intl.NumberFormat("en-RW").format(Number(order.subtotal))} RWF</span></div><div className="mt-1 flex justify-between"><span>Delivery</span><span>{Number(order.delivery_fee) === 0 ? "FREE" : `${new Intl.NumberFormat("en-RW").format(Number(order.delivery_fee))} RWF`}</span></div><div className="mt-2 flex justify-between font-semibold"><span>Total</span><span>{new Intl.NumberFormat("en-RW").format(Number(order.total_amount))} RWF</span></div></div></div>
            </div>}
          </div>;
        })}
      </div>}
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) { const classes: Record<OrderStatus, string> = { pending: "bg-amber-50 text-amber-700", confirmed: "bg-blue-50 text-blue-700", delivered: "bg-emerald-50 text-emerald-700", cancelled: "bg-red-50 text-red-700" }; return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>{status}</span>; }

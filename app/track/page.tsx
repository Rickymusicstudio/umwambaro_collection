"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, PackageSearch, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { displayPhone, normalizeRwandaPhone, rwf } from "@/lib/format";
import { forgetMyOrder, getMyOrders, saveMyOrder, type MyOrder } from "@/lib/myOrders";

const statusLabel: Record<Tracked["status"], { text: string; className: string }> = {
  pending: { text: "Received", className: "bg-amber-50 text-amber-800" },
  confirmed: { text: "On the way", className: "bg-sky-50 text-sky-800" },
  delivered: { text: "Delivered", className: "bg-emerald-50 text-emerald-700" },
  cancelled: { text: "Cancelled", className: "bg-red-50 text-red-700" },
};

type Tracked = {
  order_number: string;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  created_at: string;
  district: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  items: { name: string; quantity: number; price: number; size: string | null; color: string | null }[];
};

const steps = [
  { key: "pending", label: "Order received" },
  { key: "confirmed", label: "Confirmed – on the way" },
  { key: "delivered", label: "Delivered" },
] as const;

export default function TrackPage() {
  return <Suspense fallback={null}><Track /></Suspense>;
}

function Track() {
  const params = useSearchParams();
  const [order, setOrder] = useState(params.get("order") ?? "");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<Tracked | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // Orders placed on this phone: shown automatically, no order number needed.
  const [mine, setMine] = useState<{ saved: MyOrder; tracked: Tracked | null }[] | null>(null);

  useEffect(() => {
    const wanted = params.get("order");
    async function loadMine() {
      const saved = getMyOrders();
      const supabase = getSupabaseBrowserClient();
      const list = await Promise.all(saved.map(async (s) => {
        const { data } = supabase ? await supabase.rpc("track_order", { p_order_number: s.orderNumber, p_phone: s.phone }) : { data: null };
        return { saved: s, tracked: (data as Tracked | null) ?? null };
      }));
      setMine(list);
      // coming from "Track my order" after ordering: show it straight away
      const match = list.find((o) => o.saved.orderNumber === wanted);
      if (match?.tracked) setResult(match.tracked);
      if (match) setPhone(displayPhone(match.saved.phone));
    }
    void loadMine();
  }, [params]);

  function forget(orderNumber: string) {
    forgetMyOrder(orderNumber);
    setMine((list) => list?.filter((o) => o.saved.orderNumber !== orderNumber) ?? null);
    if (result?.order_number === orderNumber) setResult(null);
  }

  async function lookup(e: FormEvent) {
    e.preventDefault();
    setMessage(""); setResult(null);
    if (!order.trim() || !phone.trim()) return setMessage("Enter your order number and phone number.");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return setMessage("The shop is not connected yet.");
    setLoading(true);
    const { data, error } = await supabase.rpc("track_order", { p_order_number: order.trim(), p_phone: phone });
    setLoading(false);
    if (error) return setMessage("Something went wrong. Please try again.");
    if (!data) return setMessage("We couldn't find that order. Check the order number and the phone you used.");
    const tracked = data as Tracked;
    setResult(tracked);
    // remember it on this phone so next time there's nothing to type
    const saved: MyOrder = { orderNumber: tracked.order_number, phone: normalizeRwandaPhone(phone), total: tracked.total, placedAt: tracked.created_at };
    saveMyOrder(saved);
    setMine((list) => [{ saved, tracked }, ...(list ?? []).filter((o) => o.saved.orderNumber !== saved.orderNumber)]);
  }

  const stepIndex = result ? steps.findIndex((s) => s.key === result.status) : -1;
  const input = "mt-1 h-12 w-full rounded-lg border border-neutral-400 px-3 text-base outline-none focus:border-[var(--um-cta)] focus:ring-2 focus:ring-[var(--um-cta)]/30";

  return (
    <div className="mx-auto max-w-2xl space-y-3 px-2 py-4 sm:px-4">
      {mine && mine.length > 0 && (
        <section className="rounded-lg bg-white p-4 sm:p-6">
          <h1 className="flex items-center gap-2 text-xl font-bold"><PackageSearch /> Your orders</h1>
          <p className="mt-1 text-sm text-neutral-600">Orders made on this phone. Tap one to see where it is.</p>
          <ul className="mt-3 divide-y divide-neutral-200">
            {mine.map(({ saved, tracked }) => (
              <li key={saved.orderNumber} className="flex items-center gap-2">
                <button type="button" disabled={!tracked}
                  onClick={() => { setResult(tracked); setOrder(saved.orderNumber); setPhone(displayPhone(saved.phone)); setMessage(""); }}
                  className={`flex min-w-0 flex-1 items-center justify-between gap-3 py-3 text-left ${result?.order_number === saved.orderNumber ? "font-semibold" : ""}`}>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{saved.orderNumber}</span>
                    <span className="block text-xs text-neutral-500">{new Date(saved.placedAt).toLocaleDateString("en-GB")} · {rwf(tracked?.total ?? saved.total)}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    {tracked
                      ? <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusLabel[tracked.status].className}`}>{statusLabel[tracked.status].text}</span>
                      : <span className="text-xs text-neutral-500">Not found</span>}
                    <ChevronRight size={18} className="text-neutral-400" />
                  </span>
                </button>
                <button type="button" onClick={() => forget(saved.orderNumber)} aria-label={`Remove ${saved.orderNumber} from this list`}
                  className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"><X size={16} /></button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form onSubmit={lookup} className="rounded-lg bg-white p-4 sm:p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold"><PackageSearch /> {mine?.length ? "Track another order" : "Track your order"}</h2>
        <p className="mt-1 text-sm text-neutral-600">No account needed. Orders you make on this phone appear above automatically.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Order number<input className={input} value={order} onChange={(e) => setOrder(e.target.value)} placeholder="UMW-…" /></label>
          <label className="text-sm font-semibold">Phone used for the order<input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" placeholder="0788 123 456" /></label>
        </div>
        <button disabled={loading} className="mt-4 w-full rounded-full bg-[var(--um-cta)] text-[var(--um-cta-text)] py-3 font-bold hover:bg-[var(--um-cta-hover)] disabled:opacity-60">{loading ? "Searching…" : "Track order"}</button>
        {message && <p className="mt-3 rounded-lg bg-[#fff3f3] p-3 text-sm font-semibold text-[#cc0c39]">{message}</p>}
      </form>

      {result && (
        <section className="rounded-lg bg-white p-4 sm:p-6">
          <p className="text-sm text-neutral-600">Order {result.order_number} · {new Date(result.created_at).toLocaleDateString("en-GB")}</p>
          {result.status === "cancelled" ? (
            <p className="mt-3 rounded-lg bg-[#fff3f3] p-3 font-bold text-[#cc0c39]">This order was cancelled.</p>
          ) : (
            <ol className="mt-4 grid grid-cols-3 gap-1">
              {steps.map((s, i) => (
                <li key={s.key} className="text-center">
                  <span className={`block h-2 rounded-full ${i <= stepIndex ? "bg-[#067d62]" : "bg-neutral-200"}`} />
                  <span className={`mt-2 block text-xs font-semibold ${i <= stepIndex ? "text-[#067d62]" : "text-neutral-500"}`}>{s.label}</span>
                </li>
              ))}
            </ol>
          )}
          <ul className="mt-5 divide-y divide-neutral-200 text-sm">
            {result.items.map((it, i) => (
              <li key={i} className="flex justify-between gap-3 py-2">
                <span>{it.name} × {it.quantity}{it.size ? ` · ${it.size}` : ""}</span>
                <span className="font-semibold">{rwf(it.price * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-1 border-t border-neutral-200 pt-2 text-sm">
            <div className="flex justify-between"><dt>Delivery ({result.district})</dt><dd>{result.delivery_fee ? rwf(result.delivery_fee) : "Free"}</dd></div>
            <div className="flex justify-between text-base font-bold"><dt>Total to pay</dt><dd>{rwf(result.total)}</dd></div>
          </dl>
        </section>
      )}
    </div>
  );
}

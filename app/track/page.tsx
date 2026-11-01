"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { rwf } from "@/lib/format";

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
    setResult(data as Tracked);
  }

  const stepIndex = result ? steps.findIndex((s) => s.key === result.status) : -1;
  const input = "mt-1 h-12 w-full rounded-lg border border-neutral-400 px-3 text-base outline-none focus:border-[#b3261e] focus:ring-2 focus:ring-[#b3261e]/30";

  return (
    <div className="mx-auto max-w-2xl space-y-3 px-2 py-4 sm:px-4">
      <form onSubmit={lookup} className="rounded-lg bg-white p-4 sm:p-6">
        <h1 className="flex items-center gap-2 text-xl font-bold"><PackageSearch /> Track your order</h1>
        <p className="mt-1 text-sm text-neutral-600">No account needed. Use the order number you got after ordering.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Order number<input className={input} value={order} onChange={(e) => setOrder(e.target.value)} placeholder="UMW-…" /></label>
          <label className="text-sm font-semibold">Phone used for the order<input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" placeholder="0788 123 456" /></label>
        </div>
        <button disabled={loading} className="mt-4 w-full rounded-full bg-[#b3261e] text-white py-3 font-bold hover:bg-[#8f1d17] disabled:opacity-60">{loading ? "Searching…" : "Track order"}</button>
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

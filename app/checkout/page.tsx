"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, Lock } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { rwf, normalizeRwandaPhone, isValidRwandaPhone, uuid } from "@/lib/format";
import type { CustomerDetails } from "@/types/order";

type Zone = { district: string; province: string; fee: number };

const emptyForm: CustomerDetails = { fullName: "", phone: "", email: "", district: "", sector: "", address: "", notes: "" };
const SAVED_KEY = "umwambaro-delivery";

function whatsappMessage(orderNumber: string, c: CustomerDetails, items: ReturnType<typeof useCart>["items"], fee: number, total: number) {
  const lines = items.map((i, n) =>
    `${n + 1}. ${i.product.name} x${i.quantity}${i.size ? ` (Size ${i.size})` : ""}${i.color ? ` (${i.color})` : ""} – ${rwf(i.product.price * i.quantity)}`);
  return [
    `NEW ORDER ${orderNumber}`, "",
    `Name: ${c.fullName}`, `Phone: ${normalizeRwandaPhone(c.phone)}`,
    `District: ${c.district}${c.sector ? `, ${c.sector}` : ""}`, `Address: ${c.address}`,
    c.notes ? `Notes: ${c.notes}` : "", "",
    ...lines, "",
    `Delivery: ${fee ? rwf(fee) : "Free"}`, `TOTAL: ${rwf(total)}`, "Payment: Cash on delivery",
  ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState<CustomerDetails>(emptyForm);
  const [zones, setZones] = useState<Zone[] | null>(null);
  const [zoneError, setZoneError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // One id per checkout: pressing "Place order" twice can never create two orders.
  const orderId = useRef<string>("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_KEY);
      if (saved) setForm((f) => ({ ...f, ...JSON.parse(saved) }));
    } catch { /* ignore */ }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setZoneError("The shop is not connected yet."); return; }
    supabase.from("delivery_zones").select("district, province, fee").eq("active", true).order("sort")
      .then(({ data, error }) => {
        if (error) setZoneError("Could not load delivery areas. Please refresh the page.");
        setZones((data ?? []) as Zone[]);
      });
  }, []);

  const byProvince = useMemo(() => {
    const groups = new Map<string, Zone[]>();
    (zones ?? []).forEach((z) => groups.set(z.province, [...(groups.get(z.province) ?? []), z]));
    return [...groups.entries()];
  }, [zones]);
  const zone = zones?.find((z) => z.district === form.district);
  const fee = zone?.fee ?? 0;
  const total = subtotal + fee;

  const set = (k: keyof CustomerDetails) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.fullName.trim() || !form.phone.trim() || !form.district || !form.address.trim()) {
      return setError("Please fill in your name, phone, district and address.");
    }
    if (!isValidRwandaPhone(form.phone)) return setError("Please enter a valid phone number, e.g. 0788 123 456.");

    if (!orderId.current) orderId.current = uuid();
    const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER?.replace(/\D/g, "");
    // open WhatsApp tab right away (from the click) so phones don't block it
    const popup = whatsapp ? window.open("about:blank", "_blank") : null;
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const token = (await supabase?.auth.getSession())?.data.session?.access_token;
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          clientOrderId: orderId.current,
          customer: form,
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity, color: i.color, size: i.size })),
          paymentMethod: "cash_on_delivery",
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) { popup?.close(); setError(result.error ?? "We could not place your order. Please try again."); return; }

      const order = result.order as { orderNumber: string; total: number; shipping: number };
      try {
        const { fullName, phone, email, district, sector, address } = form;
        localStorage.setItem(SAVED_KEY, JSON.stringify({ fullName, phone, email, district, sector, address }));
      } catch { /* ignore */ }

      if (popup && whatsapp) {
        const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage(order.orderNumber, form, items, order.shipping, order.total))}`;
        popup.location.replace(url);
      }
      clearCart();
      router.push(`/checkout/success?order=${encodeURIComponent(order.orderNumber)}&total=${order.total}`);
    } catch {
      popup?.close();
      setError("No internet connection. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-2 py-6 sm:px-4">
        <div className="rounded-lg bg-white p-10 text-center">
          <h1 className="text-xl font-bold">Your cart is empty</h1>
          <Link href="/shop" className="mt-5 inline-block rounded-full bg-[#ffd814] px-6 py-3 font-bold">Start shopping</Link>
        </div>
      </div>
    );
  }

  const input = "mt-1 h-12 w-full rounded-lg border border-neutral-400 bg-white px-3 text-base outline-none focus:border-[#e77600] focus:ring-2 focus:ring-[#e77600]/30";

  return (
    <div className="mx-auto max-w-5xl px-2 py-3 sm:px-4 sm:py-4">
      <h1 className="mb-3 flex items-center gap-2 text-xl font-bold sm:text-2xl"><Lock size={20} /> Checkout</h1>
      <form onSubmit={submit} className="grid gap-3 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <section className="rounded-lg bg-white p-4 sm:p-5">
            <h2 className="text-lg font-bold">1. Delivery details</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold">Full name *<input className={input} value={form.fullName} onChange={set("fullName")} autoComplete="name" /></label>
              <label className="text-sm font-semibold">Phone number *<input className={input} value={form.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="0788 123 456" /></label>
              <label className="text-sm font-semibold">District *
                <select className={input} value={form.district} onChange={set("district")} disabled={!zones}>
                  <option value="">{zones ? "Choose your district" : "Loading…"}</option>
                  {byProvince.map(([province, list]) => (
                    <optgroup key={province} label={province === "Kigali" ? "Kigali City" : `${province} Province`}>
                      {list.map((z) => <option key={z.district} value={z.district}>{z.district} – {z.fee ? rwf(z.fee) : "Free delivery"}</option>)}
                    </optgroup>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">Sector<input className={input} value={form.sector ?? ""} onChange={set("sector")} placeholder="e.g. Kimironko" /></label>
              <label className="text-sm font-semibold sm:col-span-2">Address / directions *
                <textarea className={`${input} h-auto py-2`} rows={2} value={form.address} onChange={set("address")} placeholder="Street, house, nearby place we can find easily" />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">Notes (optional)
                <input className={input} value={form.notes ?? ""} onChange={set("notes")} placeholder="Best time to call, etc." />
              </label>
            </div>
            {zoneError && <p className="mt-3 text-sm font-semibold text-[#cc0c39]">{zoneError}</p>}
          </section>

          <section className="rounded-lg bg-white p-4 sm:p-5">
            <h2 className="text-lg font-bold">2. Payment</h2>
            <div className="mt-3 flex items-center gap-3 rounded-lg border-2 border-[#e77600] bg-[#fffaf2] p-3">
              <Banknote className="text-[#067d62]" />
              <div><p className="font-bold">Pay on delivery</p><p className="text-sm text-neutral-600">Pay when your order arrives. We call you first to confirm.</p></div>
            </div>
          </section>

          <section className="rounded-lg bg-white p-4 sm:p-5">
            <h2 className="text-lg font-bold">3. Your items ({items.length})</h2>
            <ul className="mt-2 divide-y divide-neutral-200">
              {items.map((i) => {
                const img = i.product.images[0] ?? i.product.image;
                return (
                  <li key={i.id} className="flex items-center gap-3 py-2">
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-neutral-100">{img && <Image src={img} alt="" fill sizes="56px" className="object-cover" />}</span>
                    <span className="min-w-0 flex-1 text-sm"><span className="line-clamp-1">{i.product.name}</span><span className="text-neutral-500">Qty {i.quantity}{i.size ? ` · ${i.size}` : ""}</span></span>
                    <span className="text-sm font-bold">{rwf(i.product.price * i.quantity)}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="h-fit rounded-lg bg-white p-4 lg:sticky lg:top-32">
          <button disabled={loading || !zones?.length} className="w-full rounded-full bg-[#ffd814] py-3 font-bold hover:bg-[#f7ca00] disabled:opacity-60">
            {loading ? "Placing order…" : "Place order"}
          </button>
          <p className="mt-2 text-center text-xs text-neutral-600">You pay when it arrives.</p>
          <dl className="mt-4 space-y-1 border-t border-neutral-200 pt-3 text-sm">
            <div className="flex justify-between"><dt>Items:</dt><dd>{rwf(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Delivery:</dt><dd>{form.district ? (fee ? rwf(fee) : "Free") : "Choose district"}</dd></div>
            <div className="flex justify-between border-t border-neutral-200 pt-2 text-lg font-bold text-[#b12704]"><dt>Order total:</dt><dd>{rwf(total)}</dd></div>
          </dl>
          {error && <p role="alert" className="mt-3 rounded-lg bg-[#fff3f3] p-3 text-sm font-semibold text-[#cc0c39]">{error}</p>}
        </aside>
      </form>
    </div>
  );
}

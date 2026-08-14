"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/components/layout/Container";
import Price from "@/components/ui/Price";
import { useCart } from "@/context/CartContext";
import type { CustomerDetails } from "@/types/order";

const initialForm: CustomerDetails = {
  fullName: "",
  phone: "",
  email: "",
  district: "",
  sector: "",
  address: "",
  notes: "",
};

function normalizeRwandaPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("250") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `250${digits.slice(1)}`;
  return digits;
}

function money(value: number) {
  return `${new Intl.NumberFormat("en-RW").format(value)} RWF`;
}

function buildWhatsAppMessage(args: {
  orderNumber: string;
  customer: CustomerDetails;
  items: ReturnType<typeof useCart>["items"];
  total: number;
  shipping: number;
}) {
  const { orderNumber, customer, items, total, shipping } = args;

  const itemLines = items
    .map((item, index) => {
      const details = [
        `Qty: ${item.quantity}`,
        item.size ? `Size: ${item.size}` : "",
        item.color ? `Color: ${item.color}` : "",
      ].filter(Boolean);

      return [
        `${index + 1}. ${item.product.name}`,
        `   ${details.join(" | ")}`,
        `   Price: ${money(item.product.price * item.quantity)}`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    "UMWAMBARO COLLECTIONS",
    "==============================",
    "NEW ORDER",
    "",
    `Order: ${orderNumber}`,
    "",
    "CUSTOMER",
    "------------------------------",
    `Name:  ${customer.fullName}`,
    `Phone: ${normalizeRwandaPhone(customer.phone)}`,
    customer.email?.trim() ? `Email: ${customer.email.trim()}` : "",
    "",
    "DELIVERY",
    "------------------------------",
    `District: ${customer.district}`,
    customer.sector?.trim() ? `Sector:   ${customer.sector.trim()}` : "",
    `Address:  ${customer.address}`,
    customer.notes?.trim() ? `Notes:    ${customer.notes.trim()}` : "",
    "",
    "ITEMS",
    "------------------------------",
    itemLines,
    "",
    "------------------------------",
    `Subtotal: ${money(total - shipping)}`,
    `Delivery: ${shipping === 0 ? "FREE" : money(shipping)}`,
    `TOTAL:    ${money(total)}`,
    "",
    "PAYMENT",
    "------------------------------",
    "Cash on Delivery",
    "",
    "Please confirm this order with the customer.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function openWhatsAppOrder(
  orderNumber: string,
  customer: CustomerDetails,
  items: ReturnType<typeof useCart>["items"],
  total: number,
  shipping: number,
  popup: Window | null,
) {
  const adminNumber = process.env.NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER?.replace(/\D/g, "");
  if (!adminNumber) {
    popup?.close();
    return;
  }

  const message = buildWhatsAppMessage({ orderNumber, customer, items, total, shipping });
  const url = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;

  if (popup && !popup.closed) {
    popup.location.replace(url);
    try {
      popup.opener = null;
    } catch {
      // Some browsers make opener read-only for an already-opened window.
    }
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const shipping = 0;
  const total = subtotal + shipping;

  function update(field: keyof CustomerDetails, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!form.fullName.trim() || !form.phone.trim() || !form.district.trim() || !form.address.trim()) {
      setError("Please complete your name, phone, district, and delivery address.");
      return;
    }

    // Open a blank tab immediately from the click event. This avoids popup
    // blockers when the order API finishes asynchronously.
    const whatsappPopup = window.open("about:blank", "_blank");

    setLoading(true);

    try {
      const clientOrderId = crypto.randomUUID();
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientOrderId,
          customer: form,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
          })),
          shipping,
          paymentMethod: "cash_on_delivery",
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        whatsappPopup?.close();
        setError(result.error ?? "We could not place your order.");
        return;
      }

      const orderNumber = result.order?.orderNumber as string | undefined;
      const savedTotal = Number(result.order?.total ?? total);

      if (orderNumber) {
        openWhatsAppOrder(orderNumber, form, items, savedTotal, shipping, whatsappPopup);
      } else {
        whatsappPopup?.close();
      }

      clearCart();
      router.push(`/checkout/success?order=${encodeURIComponent(orderNumber ?? "")}`);
    } catch (err) {
      whatsappPopup?.close();
      setError(err instanceof Error ? err.message : "Unable to place your order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) {
    return (
      <main className="bg-[#f7efe4] py-16">
        <Container>
          <div className="mx-auto max-w-xl rounded-3xl bg-[#fffaf3] p-10 text-center shadow-sm">
            <h1 className="text-3xl font-semibold">Your cart is empty</h1>
            <p className="mt-3 text-[#6f625d]">Add something to your cart before checking out.</p>
            <Link href="/shop" className="mt-7 inline-flex rounded-xl bg-[#a44a2f] px-6 py-3 font-semibold text-white">Browse products</Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-[#f7efe4] py-10 sm:py-14">
      <Container>
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a44a2f]">Almost there</p>
          <h1 className="mt-2 text-4xl font-semibold">Checkout</h1>
          <p className="mt-3 text-[#6f625d]">Enter your delivery details. Payment is currently Cash on Delivery.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={submit} className="rounded-3xl bg-[#fffaf3] p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold">Delivery information</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Full name" value={form.fullName} onChange={(v) => update("fullName", v)} required />
              <Field label="Phone number" value={form.phone} onChange={(v) => update("phone", v)} required placeholder="07XXXXXXXX" />
              <Field label="Email (optional)" type="email" value={form.email ?? ""} onChange={(v) => update("email", v)} />
              <Field label="District" value={form.district} onChange={(v) => update("district", v)} required placeholder="Gasabo" />
              <Field label="Sector (optional)" value={form.sector ?? ""} onChange={(v) => update("sector", v)} />
              <div className="sm:col-span-2"><label className="text-sm font-semibold">Delivery address *</label><textarea required value={form.address} onChange={(e) => update("address", e.target.value)} rows={4} placeholder="Street, house/building, landmark..." className="mt-2 w-full rounded-xl border border-[#d8c8b6] bg-white px-4 py-3 outline-none focus:border-[#a44a2f]" /></div>
              <div className="sm:col-span-2"><label className="text-sm font-semibold">Order notes (optional)</label><textarea value={form.notes ?? ""} onChange={(e) => update("notes", e.target.value)} rows={3} placeholder="Anything we should know?" className="mt-2 w-full rounded-xl border border-[#d8c8b6] bg-white px-4 py-3 outline-none focus:border-[#a44a2f]" /></div>
            </div>

            <div className="mt-8 rounded-2xl border border-[#d7b46b]/40 bg-[#fff8ed] p-5"><p className="font-semibold">Payment method</p><p className="mt-1 text-sm text-[#6f625d]">Cash on Delivery — pay when your order arrives.</p></div>
            <p className="mt-4 text-xs leading-5 text-[#8b7d76]">After the order is saved, WhatsApp will open with a prepared order message. Tap Send in WhatsApp to notify the store.</p>
            {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            <button disabled={loading} type="submit" className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#a44a2f] px-6 py-4 font-semibold text-white transition hover:bg-[#8e3d27] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Placing order..." : "Place Order"}</button>
          </form>

          <aside className="h-fit rounded-3xl bg-[#fffaf3] p-6 shadow-sm lg:sticky lg:top-28">
            <h2 className="text-xl font-semibold">Order summary</h2>
            <div className="mt-6 space-y-4">{items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><div><p className="font-medium">{item.product.name}</p><p className="text-[#6f625d]">Qty {item.quantity}{item.size ? ` · ${item.size}` : ""}{item.color ? ` · ${item.color}` : ""}</p></div><Price price={item.product.price * item.quantity} size="sm" /></div>)}</div>
            <div className="mt-6 border-t border-[#ead9c0] pt-5"><div className="flex justify-between"><span className="text-[#6f625d]">Subtotal</span><Price price={subtotal} size="sm" /></div><div className="mt-3 flex justify-between"><span className="text-[#6f625d]">Delivery</span><span className="font-semibold text-emerald-600">Free</span></div><div className="mt-5 flex justify-between border-t border-[#ead9c0] pt-5 text-lg font-semibold"><span>Total</span><Price price={total} size="lg" /></div></div>
          </aside>
        </div>
      </Container>
    </main>
  );
}

function Field({ label, value, onChange, required = false, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; placeholder?: string }) {
  return <div><label className="text-sm font-semibold">{label}{required ? " *" : ""}</label><input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 h-12 w-full rounded-xl border border-[#d8c8b6] bg-white px-4 outline-none focus:border-[#a44a2f]" /></div>;
}

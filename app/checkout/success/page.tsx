"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Phone } from "lucide-react";
import { rwf } from "@/lib/format";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center">Loading…</p>}>
      <Success />
    </Suspense>
  );
}

function Success() {
  const params = useSearchParams();
  const order = params.get("order") ?? "";
  const total = Number(params.get("total") ?? 0);

  return (
    <div className="mx-auto max-w-2xl px-2 py-6 sm:px-4">
      <div className="rounded-lg bg-white p-6 sm:p-10">
        <p className="flex items-center gap-2 text-xl font-bold text-[#067d62]"><CheckCircle2 /> Order placed, thank you!</p>
        <p className="mt-3 text-neutral-700">We will call you soon to confirm delivery. Keep your order number:</p>
        {order && (
          <div className="mt-4 rounded-lg border-2 border-dashed border-[var(--um-accent)] bg-[#fffaf2] p-4 text-center">
            <p className="text-sm text-neutral-600">Order number</p>
            <p className="mt-1 break-all text-xl font-bold tracking-wide">{order}</p>
            {total > 0 && <p className="mt-2 text-sm">Pay on delivery: <strong>{rwf(total)}</strong></p>}
          </div>
        )}
        <ol className="mt-5 space-y-2 text-sm text-neutral-700">
          <li className="flex gap-2"><Phone size={18} className="shrink-0 text-[#067d62]" /> 1. We call to confirm your order.</li>
          <li>2. We deliver to your address.</li>
          <li>3. You check the items and pay.</li>
        </ol>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Link href={`/track?order=${encodeURIComponent(order)}`} className="rounded-full bg-[var(--um-cta)] text-[var(--um-cta-text)] py-3 text-center font-bold hover:bg-[var(--um-cta-hover)]">Track my order</Link>
          <Link href="/shop" className="rounded-full border border-neutral-300 py-3 text-center font-bold hover:bg-neutral-50">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}

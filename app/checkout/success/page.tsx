"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Container from "@/components/layout/Container";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const order = searchParams.get("order");

  return (
    <main className="bg-[#f7efe4] py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl rounded-3xl bg-[#fffaf3] p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={34} /></div>
          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-[#a44a2f]">Order received</p>
          <h1 className="mt-3 text-4xl font-semibold">Thank you for shopping with UMWAMBARO.</h1>
          <p className="mt-4 leading-7 text-[#6f625d]">Your order has been recorded successfully. We&apos;ll contact you using the phone number you provided to confirm delivery.</p>
          {order && <div className="mt-6 rounded-2xl bg-[#f7efe4] p-4 text-sm"><span className="text-[#6f625d]">Order number</span><p className="mt-1 font-bold text-[#2a211f]">{order}</p></div>}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/shop" className="rounded-xl bg-[#a44a2f] px-6 py-3 font-semibold text-white">Continue Shopping</Link><Link href="/" className="rounded-xl border border-[#d8c8b6] px-6 py-3 font-semibold">Back Home</Link></div>
        </div>
      </Container>
    </main>
  );
}

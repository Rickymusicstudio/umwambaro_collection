"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/layout/Container";
import CartItem from "@/components/cart/CartItem";
import CartEmpty from "@/components/cart/CartEmpty";
import CartSummary from "@/components/cart/CartSummary";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity } = useCart();

  return (
    <main className="bg-neutral-50 py-10 sm:py-14">
      <Container>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A14A]">Your selection</p>
            <h1 className="mt-2 text-4xl font-semibold">Shopping Cart</h1>
          </div>
          <Link href="/shop" className="hidden items-center gap-2 text-sm font-semibold hover:text-[#C9A14A] sm:flex"><ArrowLeft size={17} /> Continue shopping</Link>
        </div>
        {items.length === 0 ? (
          <div className="rounded-3xl bg-white shadow-sm"><CartEmpty /></div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {items.map((item) => <CartItem key={item.id} item={item} onRemove={removeItem} onQuantityChange={updateQuantity} />)}
              <Link href="/shop" className="inline-flex items-center gap-2 pt-2 text-sm font-semibold hover:text-[#C9A14A]"><ArrowLeft size={16} /> Continue shopping</Link>
            </div>
            <div className="lg:sticky lg:top-28 lg:self-start"><CartSummary subtotal={subtotal} /></div>
          </div>
        )}
      </Container>
    </main>
  );
}

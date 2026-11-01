"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { rwf } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal, totalItems, removeItem, updateQuantity } = useCart();

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-2 py-6 sm:px-4">
        <div className="rounded-lg bg-white p-10 text-center">
          <ShoppingCart className="mx-auto text-neutral-300" size={56} />
          <h1 className="mt-4 text-xl font-bold">Your cart is empty</h1>
          <p className="mt-1 text-neutral-600">Find something you like and add it here.</p>
          <Link href="/shop" className="mt-5 inline-block rounded-full bg-[#ffd814] px-6 py-3 font-bold hover:bg-[#f7ca00]">Start shopping</Link>
        </div>
      </div>
    );
  }

  const checkout = (
    <Link href="/checkout" className="block w-full rounded-full bg-[#ffd814] py-3 text-center font-bold hover:bg-[#f7ca00]">
      Proceed to checkout ({totalItems} {totalItems === 1 ? "item" : "items"})
    </Link>
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-3 px-2 py-3 pb-28 sm:px-4 sm:py-4 lg:grid-cols-[1fr_320px] lg:pb-4">
      <section className="rounded-lg bg-white p-3 sm:p-5">
        <h1 className="border-b border-neutral-200 pb-3 text-xl font-bold sm:text-2xl">Shopping cart</h1>
        <ul className="divide-y divide-neutral-200">
          {items.map((item) => {
            const img = item.product.images[0] ?? item.product.image;
            return (
              <li key={item.id} className="flex gap-3 py-4">
                <Link href={`/shop/${item.product.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded bg-neutral-100 sm:h-32 sm:w-32">
                  {img && <Image src={img} alt={item.product.name} fill sizes="128px" className="object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/shop/${item.product.slug}`} className="line-clamp-2 font-medium hover:text-[#c45500]">{item.product.name}</Link>
                  <p className="mt-0.5 text-xs text-neutral-600">
                    {[item.size && `Size ${item.size}`, item.color, item.product.condition === "chaguwa" ? "Chaguwa" : null].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-1 font-bold">{rwf(item.product.price)}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded-full border-2 border-[#ffd814]">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Less" className="grid h-8 w-9 place-items-center">
                        {item.quantity === 1 ? <Trash2 size={15} /> : <Minus size={15} />}
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock} aria-label="More" className="grid h-8 w-9 place-items-center disabled:opacity-30">
                        <Plus size={15} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-xs font-semibold text-[#007185] hover:underline">Remove</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-neutral-200 pt-3 text-right text-lg">
          Subtotal ({totalItems} items): <strong>{rwf(subtotal)}</strong>
        </p>
      </section>

      <aside className="hidden h-fit rounded-lg bg-white p-4 lg:block">
        <p className="text-lg">Subtotal: <strong>{rwf(subtotal)}</strong></p>
        <p className="mt-1 text-sm text-neutral-600">Delivery fee is added at checkout. Pay when it arrives.</p>
        <div className="mt-4">{checkout}</div>
      </aside>

      <div className="fixed inset-x-0 bottom-[60px] z-30 border-t border-neutral-200 bg-white p-3 sm:bottom-0 lg:hidden">
        <p className="mb-2 text-center text-sm">Subtotal: <strong>{rwf(subtotal)}</strong></p>
        {checkout}
      </div>
    </div>
  );
}

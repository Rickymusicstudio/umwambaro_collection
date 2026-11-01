"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, Check, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { rwf, discountPercent } from "@/lib/format";

export default function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const images = product.images.length ? product.images : product.image ? [product.image] : [];
  const [active, setActive] = useState(0);
  const [size, setSize] = useState(product.sizes?.length === 1 ? product.sizes[0] : "");
  const [color, setColor] = useState(product.colors?.length === 1 ? product.colors[0] : "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const off = discountPercent(product.price, product.comparePrice);
  const soldOut = product.stock <= 0;
  const maxQty = Math.min(product.stock, 10);

  function add(goToCart: boolean) {
    if ((product.sizes?.length ?? 0) > 0 && !size) return setError("Please choose a size.");
    if ((product.colors?.length ?? 0) > 0 && !color) return setError("Please choose a colour.");
    setError("");
    addItem(product, qty, color || undefined, size || undefined);
    if (goToCart) { router.push("/cart"); return; }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid gap-4 pb-24 md:grid-cols-2 md:gap-8 md:pb-0 lg:grid-cols-[1.1fr_1fr_300px]">
      {/* photos */}
      <div>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
          {images[active] && <Image src={images[active]} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />}
          {off > 0 && <span className="absolute left-3 top-3 rounded bg-[#cc0c39] px-2 py-1 text-sm font-bold text-white">-{off}%</span>}
        </div>
        {images.length > 1 && (
          <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button key={src} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border-2 ${i === active ? "border-[#ff9900]" : "border-transparent"}`}>
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* details */}
      <div>
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="text-sm font-semibold text-[#007185] hover:underline">
          {product.category}
        </Link>
        <h1 className="mt-1 text-xl font-semibold leading-snug text-neutral-900 sm:text-2xl">{product.name}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.condition === "chaguwa"
            ? <span className="rounded bg-[#232f3e] px-2 py-0.5 text-xs font-bold text-white">Chaguwa (used, good condition)</span>
            : <span className="rounded bg-[#067d62] px-2 py-0.5 text-xs font-bold text-white">New</span>}
          {product.brand && <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-semibold">{product.brand}</span>}
        </div>

        <div className="mt-4 border-t border-neutral-200 pt-4">
          {off > 0 && <p className="text-sm text-[#cc0c39]">Save {off}%</p>}
          <p className="text-3xl font-bold text-neutral-900">{rwf(product.price)}</p>
          {off > 0 && <p className="text-sm text-neutral-500">Was <span className="line-through">{rwf(product.comparePrice!)}</span></p>}
        </div>

        {!!product.sizes?.length && (
          <div className="mt-5">
            <p className="mb-2 text-sm font-bold">Size: <span className="font-normal">{size || "choose one"}</span></p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button key={s} onClick={() => { setSize(s); setError(""); }}
                  className={`min-w-12 rounded-lg border-2 px-3 py-2 text-sm font-bold ${size === s ? "border-[#c45500] bg-[#fff3e0]" : "border-neutral-300 bg-white"}`}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {!!product.colors?.length && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-bold">Colour: <span className="font-normal">{color || "choose one"}</span></p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button key={c} onClick={() => { setColor(c); setError(""); }}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-bold ${color === c ? "border-[#c45500] bg-[#fff3e0]" : "border-neutral-300 bg-white"}`}>{c}</button>
              ))}
            </div>
          </div>
        )}

        {product.description && (
          <div className="mt-6 border-t border-neutral-200 pt-4">
            <p className="mb-1 font-bold">About this item</p>
            <p className="whitespace-pre-line text-sm leading-6 text-neutral-700">{product.description}</p>
          </div>
        )}
      </div>

      {/* buy box */}
      <div className="h-fit rounded-lg border border-neutral-300 bg-white p-4 md:col-span-2 lg:col-span-1">
        <p className="text-2xl font-bold">{rwf(product.price * qty)}</p>
        <p className={`mt-2 font-semibold ${soldOut ? "text-[#cc0c39]" : "text-[#067d62]"}`}>
          {soldOut ? "Sold out" : product.stock <= 3 ? `Only ${product.stock} left – order soon` : "In stock"}
        </p>
        {!soldOut && (
          <>
            {maxQty > 1 && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm font-semibold">Qty</span>
                <div className="flex items-center rounded-lg border border-neutral-300">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Less" className="grid h-10 w-10 place-items-center"><Minus size={16} /></button>
                  <span className="w-8 text-center font-bold">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="More" className="grid h-10 w-10 place-items-center"><Plus size={16} /></button>
                </div>
              </div>
            )}
            {error && <p className="mt-3 rounded bg-[#fff3e0] p-2 text-sm font-semibold text-[#c45500]">{error}</p>}
            <button onClick={() => add(false)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#ffd814] py-3 font-bold hover:bg-[#f7ca00]">
              {added ? <><Check size={18} /> Added to cart</> : "Add to cart"}
            </button>
            <button onClick={() => add(true)} className="mt-2 w-full rounded-full bg-[#ffa41c] py-3 font-bold hover:bg-[#fa8900]">Buy now</button>
          </>
        )}
        <ul className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-sm text-neutral-700">
          <li className="flex gap-2"><Banknote size={18} className="shrink-0 text-[#067d62]" /> Pay when it arrives (cash on delivery)</li>
          <li className="flex gap-2"><Truck size={18} className="shrink-0 text-[#067d62]" /> Delivery to all 30 districts – fee shown at checkout</li>
          <li className="flex gap-2"><ShieldCheck size={18} className="shrink-0 text-[#067d62]" /> Check your item before you pay</li>
        </ul>
      </div>

      {/* phone: sticky buy bar */}
      {!soldOut && (
        <div className="fixed inset-x-0 bottom-[60px] z-30 flex items-center gap-3 border-t border-neutral-200 bg-white p-3 md:hidden">
          <p className="text-lg font-bold">{rwf(product.price)}</p>
          <button onClick={() => add(false)} className="flex-1 rounded-full bg-[#ffd814] py-3 text-sm font-bold">
            {added ? "Added ✓" : "Add to cart"}
          </button>
        </div>
      )}
    </div>
  );
}

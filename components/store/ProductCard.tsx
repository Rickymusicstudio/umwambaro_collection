"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingCart } from "lucide-react";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { rwf, discountPercent } from "@/lib/format";

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const off = discountPercent(product.price, product.comparePrice);
  const image = product.images[0] ?? product.image;
  const soldOut = product.stock <= 0;
  // products with sizes/colours need a choice → send them to the product page
  const needsChoice = (product.sizes?.length ?? 0) > 1 || (product.colors?.length ?? 0) > 1;

  function add() {
    addItem(product, 1, product.colors?.[0], product.sizes?.[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <Link href={`/shop/${product.slug}`} className="relative block aspect-square bg-neutral-100">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition group-hover:scale-[1.03]"
          />
        ) : (
          <span className="grid h-full place-items-center text-xs text-neutral-400">No photo</span>
        )}
        <span className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {off > 0 && <span className="rounded bg-[#cc0c39] px-1.5 py-0.5 text-xs font-bold text-white">-{off}%</span>}
          {product.condition === "chaguwa"
            ? <span className="rounded bg-[#4a2c1d] px-1.5 py-0.5 text-[11px] font-bold text-white">Chaguwa</span>
            : product.isNew && <span className="rounded bg-[#067d62] px-1.5 py-0.5 text-[11px] font-bold text-white">New</span>}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <Link href={`/shop/${product.slug}`} className="line-clamp-2 text-sm leading-snug text-neutral-900 hover:text-[#9e2a1f]">
          {product.name}
        </Link>
        <div className="mt-auto pt-1">
          <p className="text-lg font-bold leading-none text-neutral-900">{rwf(product.price)}</p>
          {off > 0 && <p className="mt-0.5 text-xs text-neutral-500 line-through">{rwf(product.comparePrice!)}</p>}
          {soldOut ? (
            <p className="mt-1 text-xs font-semibold text-[#cc0c39]">Sold out</p>
          ) : product.stock <= 3 ? (
            <p className="mt-1 text-xs font-semibold text-[#9e2a1f]">Only {product.stock} left</p>
          ) : null}
        </div>
        {!soldOut && (needsChoice ? (
          <Link href={`/shop/${product.slug}`} className="mt-2 rounded-full bg-[#b3261e] py-2 text-center text-sm font-semiboldtext-white hover:bg-[#8f1d17]">
            Choose size
          </Link>
        ) : (
          <button onClick={add} className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-[#b3261e] py-2 text-sm font-semiboldtext-white hover:bg-[#8f1d17]">
            {added ? <><Check size={16} /> Added</> : <><ShoppingCart size={16} /> Add to cart</>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 xl:grid-cols-5">
      {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
    </div>
  );
}

// Horizontal swipe row for the home page.
export function ProductRow({ title, href, products }: { title: string; href: string; products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="rounded-lg bg-white p-3 sm:p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold text-neutral-900 sm:text-xl">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-[#6b3e26] hover:text-[#9e2a1f] hover:underline">See all</Link>
      </div>
      <div className="no-scrollbar -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 sm:gap-3">
        {products.slice(0, 12).map((p) => (
          <div key={p.id} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-[22%] lg:w-[17%]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

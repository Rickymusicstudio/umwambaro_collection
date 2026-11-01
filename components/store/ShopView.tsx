"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductGrid } from "./ProductCard";

const priceRanges = [
  { key: "0-10000", label: "Under RWF 10,000", min: 0, max: 10000 },
  { key: "10000-25000", label: "RWF 10,000 – 25,000", min: 10000, max: 25000 },
  { key: "25000-50000", label: "RWF 25,000 – 50,000", min: 25000, max: 50000 },
  { key: "50000-", label: "Over RWF 50,000", min: 50000, max: Infinity },
];

const sorts = [
  { key: "", label: "Recommended" },
  { key: "newest", label: "Newest" },
  { key: "price-low-high", label: "Price: low to high" },
  { key: "price-high-low", label: "Price: high to low" },
  { key: "best-selling", label: "Best selling" },
];

export default function ShopView({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const condition = params.get("condition") ?? "";
  const price = params.get("price") ?? "";
  const size = params.get("size") ?? "";
  const sale = params.get("sale") === "true";
  const sort = params.get("sort") ?? "";

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
  }
  const clearAll = () => router.replace(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname, { scroll: false });

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products]);
  const sizes = useMemo(() => [...new Set(products.flatMap((p) => p.sizes ?? []))], [products]);

  const list = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const range = priceRanges.find((r) => r.key === price);
    const out = products.filter((p) => {
      const text = [p.name, p.category, p.brand, p.description, p.sku, p.condition === "chaguwa" ? "chaguwa used" : "new"]
        .filter(Boolean).join(" ").toLowerCase();
      if (words.length && !words.every((w) => text.includes(w))) return false;
      if (category && p.category.toLowerCase() !== category.toLowerCase()) return false;
      if (condition && p.condition !== condition) return false;
      if (range && (p.price < range.min || p.price >= range.max)) return false;
      if (size && !p.sizes?.includes(size)) return false;
      if (sale && !(p.comparePrice && p.comparePrice > p.price)) return false;
      return true;
    });
    const time = (p: Product) => (p.createdAt ? Date.parse(p.createdAt) : 0);
    switch (sort) {
      case "newest": return out.sort((a, b) => time(b) - time(a));
      case "price-low-high": return out.sort((a, b) => a.price - b.price);
      case "price-high-low": return out.sort((a, b) => b.price - a.price);
      case "best-selling": return out.sort((a, b) => Number(!!b.bestSeller) - Number(!!a.bestSeller));
      default: return out.sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || time(b) - time(a));
    }
  }, [products, q, category, condition, price, size, sale, sort]);

  const chips = [
    category && { label: category, clear: () => set("category", "") },
    condition && { label: condition === "chaguwa" ? "Chaguwa" : "New", clear: () => set("condition", "") },
    price && { label: priceRanges.find((r) => r.key === price)?.label ?? price, clear: () => set("price", "") },
    size && { label: `Size ${size}`, clear: () => set("size", "") },
    sale && { label: "Deals", clear: () => set("sale", "") },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const filters = (
    <div className="space-y-6 text-sm">
      <FilterGroup title="Category">
        <Option active={!category} onClick={() => set("category", "")}>All</Option>
        {categories.map((c) => <Option key={c} active={category.toLowerCase() === c.toLowerCase()} onClick={() => set("category", c)}>{c}</Option>)}
      </FilterGroup>
      <FilterGroup title="Condition">
        <Option active={!condition} onClick={() => set("condition", "")}>All</Option>
        <Option active={condition === "new"} onClick={() => set("condition", "new")}>New</Option>
        <Option active={condition === "chaguwa"} onClick={() => set("condition", "chaguwa")}>Chaguwa (used)</Option>
      </FilterGroup>
      <FilterGroup title="Price">
        <Option active={!price} onClick={() => set("price", "")}>Any price</Option>
        {priceRanges.map((r) => <Option key={r.key} active={price === r.key} onClick={() => set("price", r.key)}>{r.label}</Option>)}
      </FilterGroup>
      {sizes.length > 0 && (
        <div>
          <p className="mb-2 font-bold">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button key={s} onClick={() => set("size", size === s ? "" : s)}
                className={`min-w-11 rounded border px-2 py-1.5 font-semibold ${size === s ? "border-[#9e2a1f] bg-[#fff3e0] text-[#9e2a1f]" : "border-neutral-300 bg-white"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <label className="flex items-center gap-2 font-semibold">
        <input type="checkbox" checked={sale} onChange={(e) => set("sale", e.target.checked ? "true" : "")} className="h-5 w-5 accent-[#9e2a1f]" />
        Deals only
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-2 py-3 sm:px-4 sm:py-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-white p-3">
        <p className="mr-auto text-sm text-neutral-700">
          <strong>{list.length}</strong> {list.length === 1 ? "result" : "results"}
          {q && <> for <strong className="text-[#9e2a1f]">&ldquo;{q}&rdquo;</strong></>}
        </p>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold lg:hidden">
          <SlidersHorizontal size={16} /> Filters{chips.length ? ` (${chips.length})` : ""}
        </button>
        <select value={sort} onChange={(e) => set("sort", e.target.value)} aria-label="Sort"
          className="rounded-lg border border-neutral-300 bg-neutral-50 px-2 py-2 text-sm font-medium">
          {sorts.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {chips.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button key={c.label} onClick={c.clear} className="flex items-center gap-1 rounded-full bg-[#4a2c1d] px-3 py-1 text-xs font-semibold text-white">
              {c.label} <X size={14} />
            </button>
          ))}
          <button onClick={clearAll} className="text-xs font-semibold text-[#6b3e26] hover:underline">Clear all</button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="hidden h-fit rounded-lg bg-white p-4 lg:block">{filters}</aside>
        <div>
          {list.length ? <ProductGrid products={list} /> : (
            <div className="rounded-lg bg-white p-10 text-center">
              <p className="text-lg font-bold">No products found</p>
              <p className="mt-1 text-sm text-neutral-600">Try another word or remove a filter.</p>
              {chips.length > 0 && <button onClick={clearAll} className="mt-4 rounded-full bg-[#b3261e] text-white px-5 py-2 text-sm font-bold">Clear filters</button>}
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-bold">Filters</p>
              <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-10 w-10 place-items-center"><X /></button>
            </div>
            {filters}
            <button onClick={() => setOpen(false)} className="mt-6 w-full rounded-full bg-[#b3261e] text-white py-3 font-bold">
              Show {list.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><p className="mb-2 font-bold">{title}</p><div className="flex flex-col items-start gap-1.5">{children}</div></div>;
}

function Option({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`text-left ${active ? "font-bold text-[#9e2a1f]" : "text-neutral-700 hover:text-[#9e2a1f]"}`}>
      {children}
    </button>
  );
}

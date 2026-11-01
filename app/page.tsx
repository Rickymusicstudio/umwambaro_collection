import Image from "next/image";
import Link from "next/link";
import { Banknote, Truck, Smartphone } from "lucide-react";
import { ProductGrid, ProductRow } from "@/components/store/ProductCard";
import { getProducts } from "@/services/product.service";
import { shopCategories, siteConfig } from "@/constants/site";

// Refresh the product lists at most every 30 seconds, so new products
// added in Admin appear without rebuilding the site.
export const revalidate = 30;

export default async function HomePage() {
  const products = await getProducts();
  const deals = products.filter((p) => p.comparePrice && p.comparePrice > p.price);
  const chaguwa = products.filter((p) => p.condition === "chaguwa");
  const newIn = products.filter((p) => p.condition !== "chaguwa");
  const best = products.filter((p) => p.bestSeller || p.trending || p.featured);

  return (
    <div className="mx-auto max-w-7xl space-y-3 px-2 py-3 sm:space-y-4 sm:px-4 sm:py-4">
      {/* banner */}
      <section className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[var(--um-dark2)] to-[var(--um-dark2)] text-white">
        <div className="relative z-10 max-w-xl p-5 sm:p-10">
          <p className="text-sm font-semibold text-[var(--um-accent-light)]">{siteConfig.fullName}</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-4xl">{siteConfig.tagline}</h1>
          <p className="mt-2 text-sm text-neutral-200 sm:text-base">New and Chaguwa clothes. Pay when it arrives.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/shop" className="rounded-full bg-[var(--um-cta)] px-5 py-2.5 text-sm font-boldtext-white hover:bg-[var(--um-cta-hover)]">Shop now</Link>
            <Link href="/shop?condition=chaguwa" className="rounded-full border border-white/60 px-5 py-2.5 text-sm font-bold hover:bg-white/10">Chaguwa deals</Link>
          </div>
        </div>
        <Image src="/images/shop-banner.jpeg" alt="" fill priority sizes="100vw" className="object-cover opacity-25" />
      </section>

      {/* trust strip */}
      <section className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-neutral-700 sm:text-sm">
        <p className="flex flex-col items-center gap-1 rounded-lg bg-white p-2 sm:flex-row sm:justify-center sm:gap-2 sm:p-3"><Banknote className="text-[#067d62]" size={20} /> Pay on delivery</p>
        <p className="flex flex-col items-center gap-1 rounded-lg bg-white p-2 sm:flex-row sm:justify-center sm:gap-2 sm:p-3"><Truck className="text-[#067d62]" size={20} /> All 30 districts</p>
        <p className="flex flex-col items-center gap-1 rounded-lg bg-white p-2 sm:flex-row sm:justify-center sm:gap-2 sm:p-3"><Smartphone className="text-[#067d62]" size={20} /> Order by phone</p>
      </section>

      {/* categories */}
      <section className="rounded-lg bg-white p-3 sm:p-4">
        <h2 className="mb-3 text-lg font-bold sm:text-xl">Shop by category</h2>
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {shopCategories.map((c) => (
            <Link key={c.name} href={`/shop?category=${encodeURIComponent(c.name)}`} className="group text-center">
              <span className="relative mx-auto block aspect-square w-full max-w-[120px] overflow-hidden rounded-full bg-neutral-100 ring-2 ring-transparent group-hover:ring-[var(--um-accent)]">
                <Image src={c.image} alt="" fill sizes="(max-width: 640px) 20vw, 120px" className="object-cover" />
              </span>
              <span className="mt-1.5 block text-xs font-semibold text-neutral-800 sm:text-sm">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {products.length === 0 ? (
        <section className="rounded-lg bg-white p-10 text-center">
          <p className="text-lg font-bold">New products are coming soon.</p>
          <p className="mt-1 text-neutral-600">Please check back shortly.</p>
        </section>
      ) : (
        <>
          <ProductRow title="Today's deals" href="/shop?sale=true" products={deals} />
          <ProductRow title="Chaguwa – great prices" href="/shop?condition=chaguwa" products={chaguwa} />
          <ProductRow title="Popular now" href="/shop?sort=best-selling" products={best} />
          <section className="rounded-lg bg-white p-3 sm:p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-bold sm:text-xl">Just arrived</h2>
              <Link href="/shop?sort=newest" className="text-sm font-semibold text-[var(--um-link)] hover:underline">See all</Link>
            </div>
            <ProductGrid products={(newIn.length ? newIn : products).slice(0, 20)} />
          </section>
        </>
      )}
    </div>
  );
}

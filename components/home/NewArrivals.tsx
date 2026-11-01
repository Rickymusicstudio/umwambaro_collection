import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ProductGrid from "@/components/product/ProductGrid";
import { getNewArrivals } from "@/services/product.service";

export default async function NewArrivals() {
  const products = await getNewArrivals();

  if (products.length === 0) return null;

  return (
    <section className="bg-[#fffaf3] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--um-accent)]">
              Fresh Styles
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              New Arrivals
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
              Discover the latest pieces added to UMWAMBARO Collections.
            </p>
          </div>

          <Link
            href="/shop?sort=newest"
            className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-[var(--um-accent)]"
          >
            View all

            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Products */}
        <ProductGrid products={products.slice(0, 4)} />
      </div>
    </section>
  );
}

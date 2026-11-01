import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

import Container from "@/components/layout/Container";
import ProductGrid from "@/components/product/ProductGrid";
import { getTrendingProducts } from "@/services/product.service";
import type { Product } from "@/types/product";

export default async function TrendingProducts() {
  const products: Product[] = await getTrendingProducts();

  if (products.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-[var(--um-soft)] via-[#f8f0f7] to-[#f5e8df] py-16 sm:py-20">
      <Container>
        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Flame
                size={17}
                strokeWidth={2}
                className="text-[var(--um-accent)]"
              />

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--um-accent)]">
                Trending
              </p>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Popular Products
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
              Discover the styles customers are loving right now.
            </p>
          </div>

          <Link
            href="/shop?sort=trending"
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
      </Container>
    </section>
  );
}

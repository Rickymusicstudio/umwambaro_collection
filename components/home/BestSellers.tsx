import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import Container from "@/components/layout/Container";
import ProductGrid from "@/components/product/ProductGrid";
import { getBestSellers } from "@/services/product.service";
import type { Product } from "@/types/product";

export default async function BestSellers() {
  const products: Product[] = await getBestSellers();

  if (products.length === 0) return null;

  return (
    <section className="bg-white py-16 sm:py-20">
      <Container>
        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Star
                size={17}
                strokeWidth={2}
                className="text-[#c8a27a]"
              />

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c8a27a]">
                Customer Favorites
              </p>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Best Sellers
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
              Shop the pieces our customers keep coming back for.
            </p>
          </div>

          <Link
            href="/shop?sort=best-selling"
            className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-[#c8a27a]"
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

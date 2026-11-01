"use client";

import { motion } from "framer-motion";

import type { Product } from "@/types/product";

import ProductCard from "@/components/product/ProductCard";

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({
  products,
}: RelatedProductsProps) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="py-20">

      <div className="mb-10 flex items-end justify-between">

        <div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--um-accent)]">
            You May Also Like
          </p>

          <h2 className="text-4xl font-bold text-neutral-900">
            Related Products
          </h2>

          <p className="mt-3 max-w-2xl text-neutral-500">
            Carefully selected products that perfectly
            complement your current selection.
          </p>

        </div>

      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{
          once: true,
        }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.12,
            },
          },
        }}
        className="
          grid
          gap-8
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={{
              hidden: {
                opacity: 0,
                y: 30,
              },
              show: {
                opacity: 1,
                y: 0,
              },
            }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

    </section>
  );
}
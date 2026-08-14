"use client";

import { motion } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";
import { PackageSearch } from "lucide-react";

interface ProductGridProps {
  products?: Product[];

  onAddToCart?: (product: Product) => void;
  onWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export default function ProductGrid({
  products = [],

  onAddToCart = () => {},
  onWishlist = () => {},
  onQuickView = () => {},
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center"
      >
        <PackageSearch className="mb-6 h-16 w-16 text-neutral-400" />

        <h2 className="text-2xl font-semibold text-neutral-900">
          No Products Found
        </h2>

        <p className="mt-3 max-w-md text-neutral-500">
          We couldn't find any products matching your current filters.
          Try adjusting your search or clearing some filters.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="
        grid
        grid-cols-1
        gap-8
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
      "
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          layout
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.25,
          }}
        >
          <ProductCard
            product={product}
            onAddToCart={onAddToCart}
            onWishlist={onWishlist}
            onQuickView={onQuickView}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
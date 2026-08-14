"use client";

import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  className?: string;
  onAddToCart?: (product: Product) => void;
  onWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export default function ProductGrid({
  products,
  loading = false,
  className = "",
  onAddToCart,
  onWishlist,
  onQuickView,
}: ProductGridProps) {
  const { addItem } = useCart();

  const handleAddToCart = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    addItem(product, 1, product.colors?.[0], product.sizes?.[0]);
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl">
            <div className="aspect-[4/5] animate-pulse rounded-2xl bg-neutral-200" />
            <div className="space-y-3 p-3">
              <div className="h-3 w-20 animate-pulse rounded bg-neutral-200" />
              <div className="h-5 w-40 animate-pulse rounded bg-neutral-200" />
              <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl bg-neutral-50 px-6 py-12 text-center">
        <h3 className="text-xl font-semibold text-neutral-900">No products found</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
          We couldn't find any products matching your filters. Try adjusting your search or browse another category.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className={`grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.04 }}
        >
          <ProductCard
            product={product}
            onAddToCart={handleAddToCart}
            onWishlist={onWishlist}
            onQuickView={onQuickView}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

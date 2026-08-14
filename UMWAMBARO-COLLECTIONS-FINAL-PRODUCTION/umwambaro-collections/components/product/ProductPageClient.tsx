"use client";

import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";

interface ProductPageClientProps {
  product: Product;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const handleAddToCart = (
    selectedProduct: Product,
    quantity: number,
    color?: string,
    size?: string
  ) => {
    addItem(selectedProduct, quantity, color, size);
  };

  const handleBuyNow = (
    selectedProduct: Product,
    quantity: number,
    color?: string,
    size?: string
  ) => {
    addItem(selectedProduct, quantity, color, size);
    router.push("/cart");
  };

  return (
    <div className="grid gap-16 lg:grid-cols-2">
      <ProductGallery product={product} />
      <ProductInfo
        product={product}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </div>
  );
}

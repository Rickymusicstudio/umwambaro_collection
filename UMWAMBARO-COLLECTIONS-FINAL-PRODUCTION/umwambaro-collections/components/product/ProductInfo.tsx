"use client";

import { useMemo, useState } from "react";

import { Heart, ShieldCheck, Truck } from "lucide-react";

import type { Product } from "@/types/product";

import Button from "@/components/ui/button";
import IconButton from "@/components/ui/IconButton";
import Price from "@/components/ui/Price";
import Rating from "@/components/ui/Rating";
import StockBadge from "@/components/ui/StockBadge";
import ColorSwatch from "@/components/ui/ColorSwatch";
import QuantitySelector from "@/components/ui/QuantitySelector";

interface ProductInfoProps {
  product: Product;

  onAddToCart?: (
    product: Product,
    quantity: number,
    color?: string,
    size?: string
  ) => void;

  onBuyNow?: (
    product: Product,
    quantity: number,
    color?: string,
    size?: string
  ) => void;

  onWishlist?: (product: Product) => void;
}

export default function ProductInfo({
  product,

  onAddToCart = () => {},

  onBuyNow = () => {},

  onWishlist = () => {},
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);

  const [selectedColor, setSelectedColor] = useState<
    string | undefined
  >(product.colors?.[0]);

  const [selectedSize, setSelectedSize] = useState<
    string | undefined
  >(product.sizes?.[0]);

  const inStock = product.stock > 0;

  const discount = useMemo(() => {
    if (
      !product.comparePrice ||
      product.comparePrice <= product.price
    ) {
      return null;
    }

    return Math.round(
      ((product.comparePrice - product.price) /
        product.comparePrice) *
        100
    );
  }, [product]);

  return (
    <div className="space-y-8">

      {/* Category */}

      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
        {product.category}
      </p>

      {/* Name */}

      <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
        {product.name}
      </h1>

      {/* Rating */}

      <Rating
        rating={product.rating}
        reviews={product.reviews}
        size="lg"
      />

      {/* Price */}

      <div className="space-y-3">

        <Price
          price={product.price}
          comparePrice={product.comparePrice}
          size="lg"
        />

        {discount && (
          <span className="inline-flex rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">
            Save {discount}%
          </span>
        )}

      </div>

      {/* Stock */}

      <StockBadge stock={product.stock} />

      {/* Condition */}

      {product.condition && (
        <div className="flex items-center gap-3 border-t pt-6">
          <span className="font-semibold text-neutral-500">Condition</span>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              product.condition === "chaguwa"
                ? "bg-[#fce7d6] text-[#9a3412]"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {product.condition === "chaguwa" ? "Chaguwa (Used)" : "New"}
          </span>
        </div>
      )}

      {/* Brand */}

      {product.brand && (
        <div className="grid grid-cols-[90px_1fr] gap-4 border-t pt-6">

          <span className="font-semibold text-neutral-500">
            Brand
          </span>

          <span className="font-medium">
            {product.brand}
          </span>

        </div>
      )}

      {/* SKU */}

      {product.sku && (
        <div className="grid grid-cols-[90px_1fr] gap-4">

          <span className="font-semibold text-neutral-500">
            SKU
          </span>

          <span>{product.sku}</span>

        </div>
      )}

      {/* Description */}

      {product.description && (
        <div className="space-y-3 border-t pt-6">

          <h2 className="text-lg font-semibold">
            Description
          </h2>

          <p className="leading-8 text-neutral-600">
            {product.description}
          </p>

        </div>
      )}

      {/* Colors */}

      {product.colors &&
        product.colors.length > 0 && (
          <div className="space-y-4">

            <div className="flex items-center justify-between">

              <h3 className="font-semibold">
                Color
              </h3>

              <span className="text-sm text-neutral-500">
                {selectedColor}
              </span>

            </div>

            <ColorSwatch
              colors={product.colors}
              selected={selectedColor}
              onSelect={setSelectedColor}
            />

          </div>
        )}

      {/* Sizes */}

      {product.sizes &&
        product.sizes.length > 0 && (
          <div className="space-y-4">

            <div className="flex items-center justify-between">

              <h3 className="font-semibold">
                Size
              </h3>

              <span className="text-sm text-neutral-500">
                {selectedSize}
              </span>

            </div>

            <div className="flex flex-wrap gap-3">

              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    setSelectedSize(size)
                  }
                  className={`
                    rounded-xl
                    border
                    px-5
                    py-3
                    font-medium
                    transition-all

                    ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 hover:border-black"
                    }
                  `}
                >
                  {size}
                </button>
              ))}

            </div>

          </div>
        )}

      {/* Quantity */}

      <div className="space-y-4">

        <h3 className="font-semibold">
          Quantity
        </h3>

        <QuantitySelector
          quantity={quantity}
          onChange={setQuantity}
          max={product.stock}
        />

      </div>

            {/* Actions */}

      <div className="space-y-4 border-t pt-8">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            fullWidth
            size="lg"
            disabled={!inStock}
            onClick={() =>
              onAddToCart(
                product,
                quantity,
                selectedColor,
                selectedSize
              )
            }
          >
            Add to Cart
          </Button>

          <IconButton
            icon={<Heart size={20} />}
            size="lg"
            aria-label="Add to wishlist"
            onClick={() => onWishlist(product)}
          />
        </div>

        <Button
          fullWidth
          size="lg"
          variant="secondary"
          disabled={!inStock}
          onClick={() =>
            onBuyNow(
              product,
              quantity,
              selectedColor,
              selectedSize
            )
          }
        >
          Buy Now
        </Button>
      </div>

      {/* Delivery Information */}

      <div className="space-y-4 border-t pt-8">
        <div className="flex items-start gap-4 rounded-2xl border border-neutral-200 p-5">
          <div className="rounded-full bg-amber-100 p-3">
            <Truck className="h-5 w-5 text-amber-600" />
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900">
              Fast Delivery
            </h3>

            <p className="mt-1 text-sm leading-6 text-neutral-600">
              We deliver across Rwanda with trusted courier partners.
              Estimated delivery: <strong>1–3 business days.</strong>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-2xl border border-neutral-200 p-5">
          <div className="rounded-full bg-emerald-100 p-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900">
              Secure Checkout
            </h3>

            <p className="mt-1 text-sm leading-6 text-neutral-600">
              Your payments are encrypted and processed securely.
              We support trusted payment methods and protect your
              personal information.
            </p>
          </div>
        </div>
      </div>

      {/* Returns */}

      <div className="rounded-3xl bg-neutral-50 p-6">
        <h3 className="mb-3 text-lg font-semibold">
          Returns & Exchanges
        </h3>

        <p className="leading-7 text-neutral-600">
          If your order arrives damaged or doesn't meet your expectations,
          you may request an exchange or return according to our return
          policy. Please contact our support team within the eligible
          return period for assistance.
        </p>
      </div>
    </div>
  );
}
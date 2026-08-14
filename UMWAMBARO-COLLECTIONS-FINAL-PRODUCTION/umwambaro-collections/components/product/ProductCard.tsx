"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";

import {
  Heart,
  Eye,
  ShoppingBag,
  Star,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Flame,
  Crown,
} from "lucide-react";

import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;

  onAddToCart?: (product: Product) => void;
  onWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;

  className?: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductCard({
  product,
  className = "",

  onAddToCart = () => {},
  onWishlist = () => {},
  onQuickView = () => {},
}: ProductCardProps) {
  const primaryImage =
    product.images[0] ??
    product.image ??
    "/images/placeholder-product.jpg";

  const secondaryImage =
    product.images[1] ??
    product.hoverImage ??
    primaryImage;

  const inStock = product.stock > 0;

  const badges = [];

  if (product.condition === "chaguwa") {
    badges.push({
      label: "CHAGUWA",
      color: "bg-[#b45309]",
      icon: Sparkles,
    });
  } else if (product.condition === "new") {
    badges.push({
      label: "NEW",
      color: "bg-emerald-600",
      icon: Sparkles,
    });
  }

  if (product.isNew) {
    badges.push({
      label: "JUST IN",
      color: "bg-[#7c3aed]",
      icon: Sparkles,
    });
  }

  if (product.featured) {
    badges.push({
      label: "FEATURED",
      color: "bg-amber-500",
      icon: Crown,
    });
  }

  if (product.trending) {
    badges.push({
      label: "TRENDING",
      color: "bg-pink-600",
      icon: Flame,
    });
  }

  if (product.bestSeller) {
    badges.push({
      label: "BEST SELLER",
      color: "bg-black",
      icon: Star,
    });
  }

  return (
    <motion.article
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.25,
      }}
      className={`
        group
        overflow-hidden
        rounded-3xl
        border
        border-neutral-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:border-neutral-300
        hover:shadow-2xl
        ${className}
      `}
    >
      <Link href={`/shop/${product.slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">

          {/* Primary Image */}

          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width:768px) 100vw,
                   (max-width:1200px) 50vw,
                   25vw"
            className="
              object-cover
              duration-700
              group-hover:scale-105
              group-hover:opacity-0
            "
          />

          {/* Hover Image */}

          <Image
            src={secondaryImage}
            alt={product.name}
            fill
            sizes="(max-width:768px) 100vw,
                   (max-width:1200px) 50vw,
                   25vw"
            className="
              object-cover
              opacity-0
              duration-700
              group-hover:opacity-100
              group-hover:scale-105
            "
          />

          {/* Overlay */}

          <div className="absolute inset-0 bg-black/5 opacity-0 transition group-hover:opacity-100" />

          {/* Badges */}

          <div className="absolute left-4 top-4 flex flex-col gap-2">

            {badges.map((badge) => {
              const Icon = badge.icon;

              return (
                <span
                  key={badge.label}
                  className={`
                    inline-flex
                    items-center
                    gap-1
                    rounded-full
                    px-3
                    py-1
                    text-[11px]
                    font-semibold
                    tracking-wide
                    text-white
                    shadow-lg
                    ${badge.color}
                  `}
                >
                  <Icon size={12} />

                  {badge.label}
                </span>
              );
            })}

          </div>

          {/* Wishlist */}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onWishlist(product);
            }}
            className="
              absolute
              right-4
              top-4
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-white/95
              shadow-xl
              transition
              hover:bg-black
              hover:text-white
            "
          >
            <Heart size={18} />
          </button>

          {/* Hover Actions */}

          <div
            className="
              absolute
              bottom-4
              left-1/2
              flex
              -translate-x-1/2
              translate-y-8
              gap-3
              opacity-0
              transition-all
              duration-300
              group-hover:translate-y-0
              group-hover:opacity-100
            "
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-white
                shadow-xl
                transition
                hover:bg-black
                hover:text-white
              "
            >
              <Eye size={18} />
            </button>

            <button
              type="button"
              disabled={!inStock}
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product);
              }}
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-black
                text-white
                shadow-xl
                transition
                hover:scale-105
                disabled:cursor-not-allowed
                disabled:bg-neutral-400
              "
            >
              <ShoppingBag size={18} />
            </button>

          </div>

        </div>

      </Link>

      {/* ---------- CONTENT STARTS HERE ---------- */}

      <div className="space-y-4 p-5">
      
              {/* Category */}

        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">
          {product.category}
        </p>

        {/* Product Name */}

        <Link
          href={`/shop/${product.slug}`}
          className="block transition hover:text-amber-700"
        >
          <h3 className="line-clamp-2 text-xl font-semibold text-neutral-900">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}

        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={16}
                className={
                  index < Math.round(product.rating ?? 5)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-neutral-300"
                }
              />
            ))}
          </div>

          <span className="text-sm text-neutral-500">
            ({product.reviews ?? 0} Reviews)
          </span>
        </div>

        {/* Color Swatches */}

        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-2">
            {product.colors.map((color) => (
              <span
                key={color}
                title={color}
                className="h-6 w-6 rounded-full border border-neutral-300 shadow-sm"
                style={{
                  backgroundColor: color.toLowerCase(),
                }}
              />
            ))}
          </div>
        )}

        {/* Price */}

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-neutral-900">
            {formatPrice(product.price)}
          </span>

          {product.comparePrice &&
            product.comparePrice > product.price && (
              <span className="text-base text-neutral-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
        </div>

        {/* Stock */}

        <div className="flex items-center gap-2 text-sm">
          {inStock ? (
            <>
              <CheckCircle2
                size={16}
                className="text-emerald-600"
              />

              <span className="font-medium text-emerald-700">
                In Stock ({product.stock})
              </span>
            </>
          ) : (
            <>
              <AlertCircle
                size={16}
                className="text-red-600"
              />

              <span className="font-medium text-red-600">
                Out of Stock
              </span>
            </>
          )}
        </div>

        {/* Add To Cart */}

        <button
          type="button"
          disabled={!inStock}
          onClick={() => onAddToCart(product)}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-black
            px-5
            py-3
            font-medium
            text-white
            transition
            duration-300
            hover:bg-neutral-800
            hover:shadow-lg
            disabled:cursor-not-allowed
            disabled:bg-neutral-400
          "
        >
          <ShoppingBag size={18} />

          Add to Cart
        </button>
      </div>
    </motion.article>
  );
}
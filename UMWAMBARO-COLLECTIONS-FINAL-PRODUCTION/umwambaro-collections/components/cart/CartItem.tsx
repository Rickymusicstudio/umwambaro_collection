"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import type { CartItem as CartItemType } from "@/types/cart";

import Price from "@/components/ui/Price";
import QuantitySelector from "@/components/ui/QuantitySelector";
import IconButton from "@/components/ui/IconButton";

interface CartItemProps {
  item: CartItemType;

  onRemove: (id: string) => void;

  onQuantityChange: (
    id: string,
    quantity: number
  ) => void;
}

export default function CartItem({
  item,
  onRemove,
  onQuantityChange,
}: CartItemProps) {
  const image =
    item.product.images[0] ??
    item.product.image ??
    "/images/placeholder-product.jpg";

  return (
    <div className="flex gap-4 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
      {/* Product Image */}

      <Link
        href={`/shop/${item.product.slug}`}
        className="relative h-28 w-24 overflow-hidden rounded-2xl bg-neutral-100"
      >
        <Image
          src={image}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </Link>

      {/* Product Details */}

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            {item.product.category}
          </p>

          <Link
            href={`/shop/${item.product.slug}`}
            className="mt-1 block"
          >
            <h3 className="font-semibold text-neutral-900 hover:text-amber-600">
              {item.product.name}
            </h3>
          </Link>

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-500">
            {item.color && (
              <span>
                <strong>Color:</strong> {item.color}
              </span>
            )}

            {item.size && (
              <span>
                <strong>Size:</strong> {item.size}
              </span>
            )}
          </div>

          <div className="mt-3">
            <Price
              price={item.product.price}
              comparePrice={item.product.comparePrice}
              size="sm"
            />
          </div>
        </div>

        {/* Quantity & Remove */}

        <div className="mt-5 flex items-center justify-between">
          <QuantitySelector
            quantity={item.quantity}
            max={item.product.stock}
            onChange={(quantity) =>
              onQuantityChange(item.id, quantity)
            }
          />

          <IconButton
            icon={<Trash2 size={18} />}
            variant="light"
            aria-label="Remove item"
            onClick={() => onRemove(item.id)}
          />
        </div>
      </div>
    </div>
  );
}
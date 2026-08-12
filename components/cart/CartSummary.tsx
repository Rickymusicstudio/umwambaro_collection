"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Button from "@/components/ui/button";
import Price from "@/components/ui/Price";

interface CartSummaryProps {
  subtotal: number;

  shipping?: number;

  discount?: number;

  checkoutUrl?: string;
}

export default function CartSummary({
  subtotal,
  shipping = 0,
  discount = 0,
  checkoutUrl = "/checkout",
}: CartSummaryProps) {
  const total = subtotal + shipping - discount;

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-neutral-900">
        Order Summary
      </h2>

      <div className="mt-8 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-neutral-600">
            Subtotal
          </span>

          <Price
            price={subtotal}
            size="sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-neutral-600">
            Shipping
          </span>

          {shipping === 0 ? (
            <span className="font-semibold text-emerald-600">
              Free
            </span>
          ) : (
            <Price
              price={shipping}
              size="sm"
            />
          )}
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">
              Discount
            </span>

            <span className="font-semibold text-red-600">
              -
              {new Intl.NumberFormat("en-RW", {
                style: "currency",
                currency: "RWF",
                maximumFractionDigits: 0,
              }).format(discount)}
            </span>
          </div>
        )}

        <div className="border-t pt-5">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">
              Total
            </span>

            <Price
              price={total}
              size="lg"
            />
          </div>
        </div>
      </div>

      <Link
        href={checkoutUrl}
        className="mt-8 block"
      >
       <Button
  size="lg"
  className="w-full"
>
  <span>Proceed to Checkout</span>

  <ArrowRight
    size={18}
    className="ml-2"
  />
</Button>
      </Link>

      <p className="mt-4 text-center text-sm text-neutral-500">
        Secure checkout with encrypted payment processing.
      </p>
    </div>
  );
}
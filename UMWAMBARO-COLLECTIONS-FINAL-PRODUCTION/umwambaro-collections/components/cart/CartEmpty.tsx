"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import Button from "@/components/ui/button";

export default function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-neutral-100 p-8">
        <ShoppingBag
          className="h-14 w-14 text-neutral-400"
        />
      </div>

      <h2 className="mt-8 text-3xl font-bold">
        Your cart is empty
      </h2>

      <p className="mt-4 max-w-md text-neutral-500">
        Looks like you haven't added anything yet.
        Discover handcrafted pieces from
        Umwambaro Collections.
      </p>

      <Link
        href="/shop"
        className="mt-8"
      >
        <Button size="lg">
          Continue Shopping
        </Button>
      </Link>
    </div>
  );
}
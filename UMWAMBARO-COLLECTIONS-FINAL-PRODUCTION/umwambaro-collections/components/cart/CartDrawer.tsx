"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { ShoppingBag } from "lucide-react";

import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import CartEmpty from "./CartEmpty";

import { useCart } from "@/context/CartContext";

interface CartDrawerProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;
}

export default function CartDrawer({
  open,
  onOpenChange,
}: CartDrawerProps) {
  const {
    items,
    subtotal,
    removeItem,
    updateQuantity,
  } = useCart();

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="right"
        className="
          flex
          w-full
          flex-col
          p-0
          sm:max-w-xl
        "
      >
        {/* Header */}

        <SheetHeader className="border-b px-6 py-5">

          <SheetTitle className="flex items-center gap-3 text-2xl">

            <ShoppingBag className="h-6 w-6" />

            Shopping Cart

            {items.length > 0 && (
              <span
                className="
                  rounded-full
                  bg-black
                  px-3
                  py-1
                  text-sm
                  text-white
                "
              >
                {items.length}
              </span>
            )}

          </SheetTitle>

        </SheetHeader>

        {/* Empty */}

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <CartEmpty />
          </div>
        ) : (
          <>
            {/* Items */}

            <div
              className="
                flex-1
                space-y-5
                overflow-y-auto
                px-6
                py-6
              "
            >
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                  onQuantityChange={
                    updateQuantity
                  }
                />
              ))}
            </div>

            {/* Summary */}

                        <div className="border-t bg-white p-6">
              <CartSummary
                subtotal={subtotal}
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
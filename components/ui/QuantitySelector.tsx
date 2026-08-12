"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;

  onChange: (value: number) => void;

  min?: number;

  max?: number;
}

export default function QuantitySelector({
  quantity,

  onChange,

  min = 1,

  max = 99,
}: QuantitySelectorProps) {
  return (
    <div className="inline-flex items-center rounded-2xl border">
      <button
        type="button"
        onClick={() =>
          quantity > min &&
          onChange(quantity - 1)
        }
        className="p-4 hover:bg-neutral-100"
      >
        <Minus size={18} />
      </button>

      <div className="min-w-[60px] text-center font-semibold">
        {quantity}
      </div>

      <button
        type="button"
        onClick={() =>
          quantity < max &&
          onChange(quantity + 1)
        }
        className="p-4 hover:bg-neutral-100"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";

interface StockBadgeProps {
  stock: number;

  className?: string;
}

export default function StockBadge({
  stock,
  className = "",
}: StockBadgeProps) {
  const inStock = stock > 0;

  return (
    <div
      className={`flex items-center gap-2 text-sm font-medium ${className}`}
    >
      {inStock ? (
        <>
          <CheckCircle2
            size={17}
            className="text-emerald-600"
          />

          <span className="text-emerald-700">
            In Stock ({stock})
          </span>
        </>
      ) : (
        <>
          <AlertCircle
            size={17}
            className="text-red-600"
          />

          <span className="text-red-600">
            Out of Stock
          </span>
        </>
      )}
    </div>
  );
}
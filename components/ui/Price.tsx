"use client";

import { motion } from "framer-motion";

interface PriceProps {
  price: number;
  comparePrice?: number;

  currency?: "RWF";

  size?: "sm" | "md" | "lg";

  className?: string;
}

function formatPrice(
  value: number,
  currency: "RWF" = "RWF"
) {
  return `${currency} ${new Intl.NumberFormat("en-RW").format(Math.round(value))}`;
}

export default function Price({
  price,
  comparePrice,
  currency = "RWF",
  size = "md",
  className = "",
}: PriceProps) {
  const discount =
    comparePrice && comparePrice > price
      ? Math.round(
          ((comparePrice - price) / comparePrice) * 100
        )
      : null;

  const priceSize = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const compareSize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${className}`}
    >
      <motion.span
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className={`
          font-bold
          text-neutral-900
          ${priceSize[size]}
        `}
      >
        {formatPrice(price, currency)}
      </motion.span>

      {comparePrice &&
        comparePrice > price && (
          <>
            <span
              className={`
                line-through
                text-neutral-400
                ${compareSize[size]}
              `}
            >
              {formatPrice(comparePrice, currency)}
            </span>

            <span
              className="
                rounded-full
                bg-red-100
                px-3
                py-1
                text-xs
                font-semibold
                text-red-600
              "
            >
              -{discount}%
            </span>
          </>
        )}
    </div>
  );
}
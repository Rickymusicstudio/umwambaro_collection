"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface RatingProps {
  rating?: number;
  reviews?: number;

  size?: "sm" | "md" | "lg";

  showReviews?: boolean;

  className?: string;
}

export default function Rating({
  rating = 5,
  reviews = 0,
  size = "md",
  showReviews = true,
  className = "",
}: RatingProps) {
  const iconSize = {
    sm: 14,
    md: 17,
    lg: 20,
  };

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 5,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`flex items-center gap-2 ${className}`}
    >
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={iconSize[size]}
            className={
              index < Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-neutral-300"
            }
          />
        ))}
      </div>

      <span
        className={`font-medium text-neutral-600 ${textSize[size]}`}
      >
        {rating.toFixed(1)}
      </span>

      {showReviews && (
        <span
          className={`text-neutral-500 ${textSize[size]}`}
        >
          ({reviews} Reviews)
        </span>
      )}
    </motion.div>
  );
}
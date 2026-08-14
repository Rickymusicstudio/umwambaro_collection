"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface IconButtonProps extends HTMLMotionProps<"button"> {
  icon: ReactNode;

  size?: "sm" | "md" | "lg";

  variant?: "light" | "dark";

  loading?: boolean;
}

export default function IconButton({
  icon,

  size = "md",

  variant = "light",

  loading = false,

  className = "",

  disabled,

  ...props
}: IconButtonProps) {
  const sizes = {
    sm: "h-9 w-9",

    md: "h-11 w-11",

    lg: "h-14 w-14",
  };

  const variants = {
    light:
      "bg-white text-neutral-900 shadow-lg hover:bg-black hover:text-white",

    dark:
      "bg-black text-white hover:bg-neutral-800",
  };

  return (
    <motion.button
      whileHover={{
        scale: 1.08,
      }}
      whileTap={{
        scale: 0.95,
      }}
      disabled={disabled || loading}
      className={`
        inline-flex
        items-center
        justify-center
        rounded-full
        transition-all
        duration-300
        disabled:cursor-not-allowed
        disabled:opacity-50

        ${sizes[size]}
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span
          className="
            h-5
            w-5
            animate-spin
            rounded-full
            border-2
            border-current
            border-t-transparent
          "
        />
      ) : (
        icon
      )}
    </motion.button>
  );
}
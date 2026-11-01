"use client";

import * as React from "react";
import {
  motion,
  type HTMLMotionProps,
} from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * HTMLMotionProps allows Framer Motion types for `children`.
 * For this reusable Button component we want normal React children,
 * so we explicitly replace the children type with React.ReactNode.
 */
export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode;

  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger";

  size?:
    | "sm"
    | "md"
    | "lg"
    | "icon-sm"
    | "icon-md"
    | "icon-lg";

  loading?: boolean;

  fullWidth?: boolean;

  leftIcon?: React.ReactNode;

  rightIcon?: React.ReactNode;
}

const variants = {
  primary:
    "bg-[var(--um-cta)] text-[var(--um-cta-text)] hover:bg-[var(--um-cta-hover)]",

  secondary:
    "bg-[var(--um-dark2)] text-white hover:bg-[var(--um-dark)]",

  outline:
    "border border-neutral-300 bg-white hover:bg-neutral-100",

  ghost:
    "hover:bg-neutral-100",

  danger:
    "bg-red-600 text-white hover:bg-red-700",
} as const;

const sizes = {
  sm: "h-9 px-4 text-sm",

  md: "h-11 px-5 text-sm",

  lg: "h-14 px-7 text-base",

  "icon-sm": "h-9 w-9 p-0",

  "icon-md": "h-11 w-11 p-0",

  "icon-lg": "h-14 w-14 p-0",
} as const;

function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <motion.button
      type={type}
      whileHover={{
        scale: isDisabled ? 1 : 1.02,
      }}
      whileTap={{
        scale: isDisabled ? 1 : 0.98,
      }}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />

            <path
              fill="currentColor"
              className="opacity-75"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>

          <span>Loading...</span>
        </span>
      ) : (
        <>
          {leftIcon && (
            <span className="mr-2 flex items-center justify-center">
              {leftIcon}
            </span>
          )}

          <span>{children}</span>

          {rightIcon && (
            <span className="ml-2 flex items-center justify-center">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </motion.button>
  );
}

/*
 * Support both import styles:
 *
 * import Button from "@/components/ui/button";
 *
 * and:
 *
 * import { Button } from "@/components/ui/button";
 */
export { Button };

export default Button;
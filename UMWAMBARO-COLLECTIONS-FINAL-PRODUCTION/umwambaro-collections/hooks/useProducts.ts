"use client";

import { useMemo } from "react";
import { products } from "@/data/products";

export function useProducts() {
  return useMemo(() => ({ products }), []);
}

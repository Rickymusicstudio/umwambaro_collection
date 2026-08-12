"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface ShopHeaderProps {
  totalProducts?: number;
  search?: string;
  setSearch?: (value: string) => void;
}

export default function ShopHeader({
  totalProducts = 0,
  search = "",
  setSearch = () => {},
}: ShopHeaderProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-neutral-900 to-black p-10 text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="uppercase tracking-[0.3em] text-amber-300">
          Umwambaro Collections
        </p>

        <h1 className="mt-4 text-5xl font-bold">
          Discover Timeless African Elegance
        </h1>

        <p className="mt-4 max-w-2xl text-neutral-300">
          Luxury handcrafted fashion inspired by Rwanda.
        </p>

        <div className="mt-8 flex flex-wrap gap-6">
          <div className="rounded-2xl bg-white/10 px-6 py-4">
            <p className="text-sm">Products</p>

            <p className="text-3xl font-bold">
              {totalProducts}
            </p>
          </div>

          <div className="flex flex-1 items-center rounded-2xl bg-white/10 px-4">
            <Search className="mr-3 h-5 w-5" />

            <input
              className="w-full bg-transparent py-4 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
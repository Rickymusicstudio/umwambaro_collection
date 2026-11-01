"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

export interface ShopFilters {
  categories: string[];
  condition: "all" | "new" | "chaguwa";
  sizes: string[];
  colors: string[];
  maxPrice: number;
  inStockOnly: boolean;
}

interface FilterSidebarProps {
  categories?: string[];
  sizes?: string[];
  colors?: string[];

  filters?: ShopFilters;

  onCategoryToggle?: (category: string) => void;
  onConditionChange?: (
    condition: "all" | "new" | "chaguwa"
  ) => void;
  onSizeToggle?: (size: string) => void;
  onColorToggle?: (color: string) => void;
  onPriceChange?: (price: number) => void;
  onStockToggle?: () => void;
  onReset?: () => void;
}

const defaultFilters: ShopFilters = {
  categories: [],
  condition: "all",
  sizes: [],
  colors: [],
  maxPrice: 500000,
  inStockOnly: false,
};

export default function FilterSidebar({
  categories = [],
  sizes = [],
  colors = [],
  filters = defaultFilters,

  onCategoryToggle = () => {},
  onConditionChange = () => {},
  onSizeToggle = () => {},
  onColorToggle = () => {},
  onPriceChange = () => {},
  onStockToggle = () => {},
  onReset = () => {},
}: FilterSidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-24 rounded-3xl border border-[#ead9c0] bg-white p-6 shadow-sm"
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#2a211f]">
            Filters
          </h2>

          <p className="text-sm text-neutral-500">
            Refine your shopping experience
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border border-[#d8c8b6] px-3 py-2 text-sm transition hover:bg-neutral-100"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {/* Categories */}
      <section className="mb-8">
        <h3 className="mb-3 font-semibold text-[#2a211f]">
          Categories
        </h3>

        <div className="space-y-3">
          {categories.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-3 text-sm"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() =>
                  onCategoryToggle(category)
                }
                className="h-4 w-4"
              />

              <span>{category}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Condition */}
      <section className="mb-8">
        <h3 className="mb-3 font-semibold text-[#2a211f]">
          Condition
        </h3>

        <div className="grid grid-cols-1 gap-2">
          {[
            {
              value: "all" as const,
              label: "All items",
            },
            {
              value: "new" as const,
              label: "New",
            },
            {
              value: "chaguwa" as const,
              label: "Chaguwa (Used)",
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onConditionChange(option.value)
              }
              className={`rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                filters.condition === option.value
                  ? "border-[#C9A14A] bg-[#fff7e8] text-[#8a681f]"
                  : "border-neutral-200 bg-white hover:border-[#C9A14A]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {/* Sizes */}
      <section className="mb-8">
        <h3 className="mb-3 font-semibold text-[#2a211f]">
          Sizes
        </h3>

        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onSizeToggle(size)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                filters.sizes.includes(size)
                  ? "border-[#a44a2f] bg-[#a44a2f] text-white"
                  : "border-neutral-200 bg-white hover:border-[#a44a2f]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </section>

      {/* Colors */}
      <section className="mb-8">
        <h3 className="mb-3 font-semibold text-[#2a211f]">
          Colors
        </h3>

        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onColorToggle(color)}
              className={`rounded-full border px-4 py-2 transition ${
                filters.colors.includes(color)
                  ? "border-amber-500 bg-amber-50"
                  : "border-neutral-200 bg-white hover:border-amber-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full border border-neutral-300"
                  style={{
                    backgroundColor: color.toLowerCase(),
                  }}
                />

                <span className="text-sm">
                  {color}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Price */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-[#2a211f]">
            Maximum Price
          </h3>

          <span className="text-sm font-semibold text-[#a44a2f]">
            {filters.maxPrice.toLocaleString()} RWF
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={500000}
          step={5000}
          value={Math.min(filters.maxPrice, 500000)}
          onChange={(e) =>
            onPriceChange(Number(e.target.value))
          }
          className="w-full accent-[#a44a2f]"
        />

        <div className="mt-2 flex justify-between text-xs text-neutral-500">
          <span>0 RWF</span>
          <span>500,000 RWF</span>
        </div>
      </section>

      {/* Stock */}
      <section>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={onStockToggle}
            className="h-4 w-4"
          />

          <span>In Stock Only</span>
        </label>
      </section>
    </motion.aside>
  );
}
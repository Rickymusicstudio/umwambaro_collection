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
      className="sticky top-24 rounded-3xl border bg-white p-6 shadow-sm"
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Filters</h2>
          <p className="text-sm text-neutral-500">
            Refine your shopping experience
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:bg-neutral-100"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {/* Categories */}
      <section className="mb-8">
        <h3 className="mb-3 font-semibold">Categories</h3>

        <div className="space-y-3">
          {categories.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-3"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => onCategoryToggle(category)}
                className="h-4 w-4 rounded border-neutral-300"
              />

              <span className="text-sm">{category}</span>
            </label>
          ))}

          {categories.length === 0 && (
            <p className="text-sm text-neutral-400">
              No categories available
            </p>
          )}
        </div>
      </section>

      {/* Condition */}
      <section className="mb-8">
        <h3 className="mb-3 font-semibold">Condition</h3>

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
        <h3 className="mb-3 font-semibold">Sizes</h3>

        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onSizeToggle(size)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                filters.sizes.includes(size)
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-neutral-200 hover:border-amber-500"
              }`}
            >
              {size}
            </button>
          ))}

          {sizes.length === 0 && (
            <p className="text-sm text-neutral-400">
              No sizes available
            </p>
          )}
        </div>
      </section>

      {/* Colors */}
      <section className="mb-8">
        <h3 className="mb-3 font-semibold">Colors</h3>

        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onColorToggle(color)}
              className={`rounded-full border px-4 py-2 transition ${
                filters.colors.includes(color)
                  ? "border-amber-500 bg-amber-50"
                  : "border-neutral-200 hover:border-amber-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full border"
                  style={{
                    backgroundColor: color.toLowerCase(),
                  }}
                />

                <span className="text-sm">{color}</span>
              </div>
            </button>
          ))}

          {colors.length === 0 && (
            <p className="text-sm text-neutral-400">
              No colors available
            </p>
          )}
        </div>
      </section>

      {/* Price */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Maximum Price</h3>

          <span className="text-sm font-medium text-neutral-600">
            {new Intl.NumberFormat("en-RW").format(
              filters.maxPrice
            )}{" "}
            RWF
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={500000}
          step={5000}
          value={filters.maxPrice}
          onChange={(event) =>
            onPriceChange(Number(event.target.value))
          }
          className="w-full accent-[#C9A14A]"
        />

        <div className="mt-2 flex justify-between text-xs text-neutral-400">
          <span>0 RWF</span>
          <span>500,000 RWF</span>
        </div>
      </section>

      {/* Stock */}
      <section>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={onStockToggle}
            className="h-4 w-4 rounded border-neutral-300"
          />

          <span className="text-sm">In Stock Only</span>
        </label>
      </section>
    </motion.aside>
  );
}
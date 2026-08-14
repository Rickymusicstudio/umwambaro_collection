"use client";

import { ArrowUpDown } from "lucide-react";

export type SortOption =
  | "featured"
  | "newest"
  | "trending"
  | "best-selling"
  | "price-low-high"
  | "price-high-low"
  | "name-a-z"
  | "name-z-a";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const options: { label: string; value: SortOption }[] = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Trending", value: "trending" },
  { label: "Best Sellers", value: "best-selling" },
  { label: "Price: Low → High", value: "price-low-high" },
  { label: "Price: High → Low", value: "price-high-low" },
  { label: "Name: A → Z", value: "name-a-z" },
  { label: "Name: Z → A", value: "name-z-a" },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-neutral-600">
        <ArrowUpDown className="h-5 w-5" />
        <span className="hidden text-sm font-medium sm:block">Sort By</span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

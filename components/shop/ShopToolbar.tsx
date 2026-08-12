"use client";

import SortDropdown, {
  type SortOption,
} from "./SortDropdown";

interface ShopToolbarProps {
  totalProducts: number;
  activeFilters: number;

  sort: SortOption;
  onSortChange: (value: SortOption) => void;

  onClearFilters: () => void;
}

export default function ShopToolbar({
  totalProducts,
  activeFilters,
  sort,
  onSortChange,
  onClearFilters,
}: ShopToolbarProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-neutral-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-xl font-semibold">
          Showing {totalProducts} Product
          {totalProducts !== 1 ? "s" : ""}
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Discover handcrafted luxury from Umwambaro
          Collections.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {activeFilters > 0 && (
          <button
            onClick={onClearFilters}
            className="rounded-xl border px-4 py-2 text-sm transition hover:bg-neutral-100"
          >
            Clear Filters
          </button>
        )}

        <SortDropdown
          value={sort}
          onChange={onSortChange}
        />
      </div>
    </div>
  );
}
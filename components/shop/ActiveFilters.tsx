"use client";

interface ActiveFiltersProps {
  categories: string[];
  condition: "all" | "new" | "chaguwa";
  sizes: string[];
  colors: string[];

  inStockOnly: boolean;

  onRemoveCategory: (category: string) => void;
  onRemoveCondition: () => void;
  onRemoveSize: (size: string) => void;
  onRemoveColor: (color: string) => void;
  onRemoveStock: () => void;

  onClearAll: () => void;
}

export default function ActiveFilters({
  categories,
  condition,
  sizes,
  colors,
  inStockOnly,

  onRemoveCategory,
  onRemoveCondition,
  onRemoveSize,
  onRemoveColor,
  onRemoveStock,

  onClearAll,
}: ActiveFiltersProps) {
  const hasFilters =
    categories.length ||
    condition !== "all" ||
    sizes.length ||
    colors.length ||
    inStockOnly;

  if (!hasFilters) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onRemoveCategory(category)}
          className="rounded-full bg-neutral-100 px-4 py-2 text-sm transition hover:bg-neutral-200"
        >
          {category} ✕
        </button>
      ))}

      {condition !== "all" && (
        <button
          onClick={onRemoveCondition}
          className={`rounded-full px-4 py-2 text-sm transition ${
            condition === "chaguwa"
              ? "bg-[#fce7d6] text-[#9a3412] hover:bg-[#f7d5ba]"
              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          }`}
        >
          {condition === "chaguwa" ? "Chaguwa" : "New"} ✕
        </button>
      )}

      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onRemoveSize(size)}
          className="rounded-full bg-neutral-100 px-4 py-2 text-sm transition hover:bg-neutral-200"
        >
          {size} ✕
        </button>
      ))}

      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onRemoveColor(color)}
          className="rounded-full bg-neutral-100 px-4 py-2 text-sm transition hover:bg-neutral-200"
        >
          {color} ✕
        </button>
      ))}

      {inStockOnly && (
        <button
          onClick={onRemoveStock}
          className="rounded-full bg-green-100 px-4 py-2 text-sm text-green-700 transition hover:bg-green-200"
        >
          In Stock ✕
        </button>
      )}

      <button
        onClick={onClearAll}
        className="rounded-full border px-4 py-2 text-sm font-medium transition hover:bg-neutral-100"
      >
        Clear All
      </button>
    </div>
  );
}
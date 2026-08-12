"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { Product } from "@/types/product";
import type { SortOption } from "./SortDropdown";
import FilterSidebar, { type ShopFilters } from "./FilterSidebar";
import ProductGrid from "@/components/product/ProductGrid";
import ShopToolbar from "./ShopToolbar";
import ActiveFilters from "./ActiveFilters";

interface ShopClientProps {
  products: Product[];
}

const defaultFilters: ShopFilters = {
  categories: [],
  condition: "all",
  sizes: [],
  colors: [],
  maxPrice: 500000,
  inStockOnly: false,
};

function getInitialSort(value: string | null): SortOption {
  switch (value) {
    case "newest":
    case "trending":
    case "best-selling":
    case "price-low-high":
    case "price-high-low":
    case "name-a-z":
    case "name-z-a":
    case "featured":
      return value;
    default:
      return "featured";
  }
}

export default function ShopClient({ products }: ShopClientProps) {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlSort = searchParams.get("sort");
  const urlCondition = searchParams.get("condition");
  const query = searchParams.get("q") ?? "";
  const isSale = searchParams.get("sale") === "true";

  const initialCategory = urlCategory
    ? products.find(
        (product) =>
          product.category.toLowerCase() === urlCategory.toLowerCase()
      )?.category
    : undefined;

  const initialCondition =
    urlCondition === "new" || urlCondition === "chaguwa"
      ? urlCondition
      : "all";

  const [filters, setFilters] = useState<ShopFilters>({
    ...defaultFilters,
    categories: initialCategory ? [initialCategory] : [],
    condition: initialCondition,
  });
  const [sort, setSort] = useState<SortOption>(getInitialSort(urlSort));

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  );

  const sizes = useMemo(
    () => [...new Set(products.flatMap((p) => p.sizes ?? []))].sort(),
    [products]
  );

  const colors = useMemo(
    () => [...new Set(products.flatMap((p) => p.colors ?? []))].sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      if (
        normalizedQuery &&
        ![
          product.name,
          product.category,
          product.brand,
          product.description,
          product.sku,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery))
      ) {
        return false;
      }

      if (
        filters.categories.length &&
        !filters.categories.includes(product.category)
      ) {
        return false;
      }

      if (
        filters.condition !== "all" &&
        product.condition !== filters.condition
      ) {
        return false;
      }

      if (
        filters.sizes.length &&
        !product.sizes?.some((size) => filters.sizes.includes(size))
      ) {
        return false;
      }

      if (
        filters.colors.length &&
        !product.colors?.some((color) => filters.colors.includes(color))
      ) {
        return false;
      }

      if (product.price > filters.maxPrice) return false;
      if (filters.inStockOnly && product.stock <= 0) return false;

      if (isSale && !(product.comparePrice && product.comparePrice > product.price)) {
        return false;
      }

      return true;
    });
  }, [products, filters, query, isSale]);

  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts];

    switch (sort) {
      case "price-low-high":
        return items.sort((a, b) => a.price - b.price);
      case "price-high-low":
        return items.sort((a, b) => b.price - a.price);
      case "name-a-z":
        return items.sort((a, b) => a.name.localeCompare(b.name));
      case "name-z-a":
        return items.sort((a, b) => b.name.localeCompare(a.name));
      case "newest":
        return items.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      case "trending":
        return items.sort((a, b) => Number(b.trending) - Number(a.trending));
      case "best-selling":
        return items.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
      case "featured":
      default:
        return items.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
  }, [filteredProducts, sort]);

  const activeFilterCount =
    filters.categories.length +
    (filters.condition !== "all" ? 1 : 0) +
    filters.sizes.length +
    filters.colors.length +
    (filters.inStockOnly ? 1 : 0) +
    (isSale ? 1 : 0);

  const resetFilters = () => setFilters(defaultFilters);

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <FilterSidebar
        categories={categories}
        sizes={sizes}
        colors={colors}
        filters={filters}
        onCategoryToggle={(category) =>
          setFilters((prev) => ({
            ...prev,
            categories: prev.categories.includes(category)
              ? prev.categories.filter((c) => c !== category)
              : [...prev.categories, category],
          }))
        }
        onConditionChange={(condition) =>
          setFilters((prev) => ({ ...prev, condition }))
        }
        onSizeToggle={(size) =>
          setFilters((prev) => ({
            ...prev,
            sizes: prev.sizes.includes(size)
              ? prev.sizes.filter((s) => s !== size)
              : [...prev.sizes, size],
          }))
        }
        onColorToggle={(color) =>
          setFilters((prev) => ({
            ...prev,
            colors: prev.colors.includes(color)
              ? prev.colors.filter((c) => c !== color)
              : [...prev.colors, color],
          }))
        }
        onPriceChange={(price) =>
          setFilters((prev) => ({ ...prev, maxPrice: price }))
        }
        onStockToggle={() =>
          setFilters((prev) => ({
            ...prev,
            inStockOnly: !prev.inStockOnly,
          }))
        }
        onReset={resetFilters}
      />

      <div className="min-w-0">
        <ShopToolbar
          totalProducts={sortedProducts.length}
          activeFilters={activeFilterCount}
          sort={sort}
          onSortChange={setSort}
          onClearFilters={resetFilters}
        />

        <ActiveFilters
          categories={filters.categories}
          condition={filters.condition}
          sizes={filters.sizes}
          colors={filters.colors}
          inStockOnly={filters.inStockOnly}
          onRemoveCondition={() =>
            setFilters((prev) => ({ ...prev, condition: "all" }))
          }
          onRemoveCategory={(category) =>
            setFilters((prev) => ({
              ...prev,
              categories: prev.categories.filter((c) => c !== category),
            }))
          }
          onRemoveSize={(size) =>
            setFilters((prev) => ({
              ...prev,
              sizes: prev.sizes.filter((s) => s !== size),
            }))
          }
          onRemoveColor={(color) =>
            setFilters((prev) => ({
              ...prev,
              colors: prev.colors.filter((c) => c !== color),
            }))
          }
          onRemoveStock={() =>
            setFilters((prev) => ({ ...prev, inStockOnly: false }))
          }
          onClearAll={resetFilters}
        />

        {query && (
          <p className="mb-5 text-sm text-neutral-500">
            Search results for <strong className="text-neutral-900">{query}</strong>
          </p>
        )}

        <ProductGrid products={sortedProducts} />
      </div>
    </div>
  );
}

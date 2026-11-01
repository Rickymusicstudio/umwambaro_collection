import type { Product } from "@/types/product";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseProduct = {
  id: string;
  sku: string | null;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  condition: "new" | "chaguwa" | null;
  brand: string | null;
  price: number;
  compare_price: number | null;
  currency: string | null;
  stock: number;
  image: string | null;
  hover_image: string | null;
  images: string[] | null;
  rating: number | null;
  reviews: number | null;
  colors: string[] | null;
  sizes: string[] | null;
  featured: boolean;
  trending: boolean;
  best_seller: boolean;
  created_at: string;
};

function mapProduct(row: SupabaseProduct): Product {
  const images = row.images ?? [];
  const image = row.image ?? images[0];

  return {
    id: row.id,
    sku: row.sku ?? undefined,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    category: row.category,
    condition: row.condition ?? "new",
    brand: row.brand ?? undefined,
    price: Number(row.price),
    comparePrice: row.compare_price == null ? undefined : Number(row.compare_price),
    currency: "RWF",
    stock: Number(row.stock ?? 0),
    image,
    hoverImage: row.hover_image ?? images[1],
    images: image && images.length === 0 ? [image] : images,
    rating: row.rating == null ? undefined : Number(row.rating),
    reviews: row.reviews == null ? undefined : Number(row.reviews),
    colors: row.colors ?? undefined,
    sizes: row.sizes ?? undefined,
    featured: row.featured,
    trending: row.trending,
    isNew: (() => {
      const createdAt = Date.parse(row.created_at);
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      return Number.isFinite(createdAt) && createdAt >= Date.now() - thirtyDays;
    })(),
    bestSeller: row.best_seller,
    createdAt: row.created_at,
  };
}

async function fetchProducts(): Promise<Product[] | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  let data: unknown[] | null = null;
  let error: { message: string } | null = null;
  try {
    ({ data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false }));
  } catch (e) {
    error = { message: e instanceof Error ? e.message : String(e) };
  }

  if (error || !data) {
    console.error("Could not load products from Supabase:", error?.message);
    return null;
  }

  return (data as SupabaseProduct[]).map(mapProduct);
}

// Never show demo products to customers: if Supabase fails we show an empty shop.
export async function getProducts(): Promise<Product[]> {
  return (await fetchProducts()) ?? [];
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug);
}

export async function getTrendingProducts(): Promise<Product[]> {
  return (await getProducts()).filter((product) => product.trending);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return (await getProducts()).filter((product) => product.featured);
}

export async function getNewArrivals(): Promise<Product[]> {
  return (await getProducts())
    .filter((product) => product.isNew)
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
}

export async function getBestSellers(): Promise<Product[]> {
  return (await getProducts()).filter((product) => product.bestSeller);
}

export async function getRelatedProducts(
  category: string,
  currentProductId: string,
  limit = 4
): Promise<Product[]> {
  const products = await getProducts();

  const sameCategory = products.filter(
    (product) =>
      product.category.toLowerCase() === category.toLowerCase() &&
      product.id !== currentProductId
  );

  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const fallback = products.filter((product) => product.id !== currentProductId);
  return [
    ...sameCategory,
    ...fallback.filter((product) => !sameCategory.some((item) => item.id === product.id)),
  ].slice(0, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const search = query.trim().toLowerCase();
  const products = await getProducts();

  if (!search) return products;

  return products.filter((product) =>
    [product.name, product.category, product.brand, product.description, product.sku]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(search))
  );
}

import type { MetadataRoute } from "next";
import { siteConfig } from "@/constants/site";
import { getProducts } from "@/services/product.service";

// Tells Google about every page and product. Refreshed every hour.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const pages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/track`, changeFrequency: "monthly", priority: 0.3 },
  ];
  const products = (await getProducts()).map((p) => ({
    url: `${base}/shop/${p.slug}`,
    lastModified: p.createdAt ? new Date(p.createdAt) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [...pages, ...products];
}

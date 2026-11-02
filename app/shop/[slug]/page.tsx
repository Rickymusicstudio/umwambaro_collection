import { notFound } from "next/navigation";
import Link from "next/link";
import ProductDetail from "@/components/store/ProductDetail";
import { ProductRow } from "@/components/store/ProductCard";
import { getProduct, getRelatedProducts } from "@/services/product.service";
import { siteConfig } from "@/constants/site";
import { rwf } from "@/lib/format";

// Cache each product page for 30 seconds (like the home and shop pages)
// instead of asking the database on every visit. Pages are built on first visit.
export const revalidate = 30;
export async function generateStaticParams() {
  return [];
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product · UMWAMBARO" };
  // What WhatsApp, Facebook etc. show when someone shares the product link.
  const title = `${product.name} – ${rwf(product.price)}`;
  const description = [
    product.condition === "chaguwa" ? "Chaguwa (used, good condition)" : "New",
    product.description,
    "Pay on delivery anywhere in Rwanda.",
  ].filter(Boolean).join(" · ");
  const image = product.images[0] || product.image;
  return {
    title: `${product.name} · UMWAMBARO`,
    description,
    openGraph: {
      title, description, url: `/shop/${product.slug}`, siteName: siteConfig.fullName, type: "website",
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product.id, 12);

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-2 py-3 sm:px-4 sm:py-4">
      <nav className="text-xs text-neutral-600">
        <Link href="/" className="hover:underline">Home</Link> ›{" "}
        <Link href="/shop" className="hover:underline">Shop</Link> ›{" "}
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:underline">{product.category}</Link>
      </nav>
      <div className="rounded-lg bg-white p-3 sm:p-5">
        <ProductDetail product={product} />
      </div>
      <ProductRow title="You may also like" href={`/shop?category=${encodeURIComponent(product.category)}`} products={related} />
    </div>
  );
}

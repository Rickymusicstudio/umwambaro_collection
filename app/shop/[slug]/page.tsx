import { notFound } from "next/navigation";
import Link from "next/link";
import ProductDetail from "@/components/store/ProductDetail";
import { ProductRow } from "@/components/store/ProductCard";
import { getProduct, getRelatedProducts } from "@/services/product.service";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product ? `${product.name} · UMWAMBARO` : "Product · UMWAMBARO" };
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

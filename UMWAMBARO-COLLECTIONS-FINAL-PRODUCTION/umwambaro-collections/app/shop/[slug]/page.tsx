import { notFound } from "next/navigation";

import Container from "@/components/layout/Container";
import ProductPageClient from "@/components/product/ProductPageClient";
import ProductTabs from "@/components/product/ProductTabs";
import RelatedProducts from "@/components/product/RelatedProducts";
import { getProduct, getRelatedProducts } from "@/services/product.service";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.category, product.id);

  return (
    <main className="bg-white">
      <Container>
        <section className="py-10 sm:py-16">
          <ProductPageClient product={product} />
        </section>
        <ProductTabs product={product} />
        <RelatedProducts products={relatedProducts} />
      </Container>
    </main>
  );
}

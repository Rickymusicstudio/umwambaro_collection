import Container from "@/components/layout/Container";
import ShopClient from "@/components/shop/ShopClient";

import { getProducts } from "@/services/product.service";

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="py-14">
      <Container>
        <div className="mb-10">
          <h1 className="text-5xl font-bold">
            Shop
          </h1>

          <p className="mt-3 text-neutral-500">
            Browse all products available at Umwambaro Collections.
          </p>
        </div>

        <ShopClient
          products={products}
        />
      </Container>
    </main>
  );
}
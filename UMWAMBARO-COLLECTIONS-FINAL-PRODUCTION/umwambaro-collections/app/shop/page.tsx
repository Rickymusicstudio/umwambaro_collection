import { Suspense } from "react";

import Container from "@/components/layout/Container";
import ShopClient from "@/components/shop/ShopClient";
import { getProducts } from "@/services/product.service";

function ShopLoading() {
  return (
    <div className="grid min-h-[400px] place-items-center rounded-3xl bg-[#fffaf3]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ead9c0] border-t-[#a44a2f]" />

        <p className="mt-4 text-sm text-[#6f625d]">
          Loading products...
        </p>
      </div>
    </div>
  );
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="bg-[#f7efe4] py-14">
      <Container>
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-[#2a211f]">
            Shop
          </h1>

          <p className="mt-3 text-[#6f625d]">
            Browse all products available at Umwambaro Collections.
          </p>
        </div>

        <Suspense fallback={<ShopLoading />}>
          <ShopClient products={products} />
        </Suspense>
      </Container>
    </main>
  );
}
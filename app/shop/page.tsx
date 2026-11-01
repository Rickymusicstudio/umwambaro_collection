import { Suspense } from "react";
import ShopView from "@/components/store/ShopView";
import { getProducts } from "@/services/product.service";

// New products from Admin show up within 30 seconds.
export const revalidate = 30;

export const metadata = { title: "Shop · UMWAMBARO" };

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <Suspense fallback={<p className="p-10 text-center text-neutral-500">Loading products…</p>}>
      <ShopView products={products} />
    </Suspense>
  );
}

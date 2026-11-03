import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/Container";

const categories = [
  { name: "Women", image: "/images/categories/women.webp" },
  { name: "Men", image: "/images/categories/men.webp" },
  { name: "Kids", image: "/images/categories/kids.webp" },
  { name: "Shoes", image: "/images/categories/shoes.webp" },
  { name: "Bags", image: "/images/banner.webp" },
  { name: "Accessories", image: "/images/categories/accessories.webp" },
];

export default function Categories() {
  return (
    <section className="bg-white py-16">
      <Container>
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--um-accent)]">Explore</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Shop by Category</h2>
          <p className="mt-3 text-neutral-500">Browse our most popular collections.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link key={category.name} href={`/shop?category=${encodeURIComponent(category.name)}`} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
                <Image src={category.image} alt={category.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <h3 className="mt-4 text-center font-semibold transition group-hover:text-[var(--um-accent)]">{category.name}</h3>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

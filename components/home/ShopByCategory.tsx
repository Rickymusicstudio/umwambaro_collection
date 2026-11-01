"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Women",
    slug: "women",
    description: "Elegant styles for every occasion",
    image:
      "/images/women.jpeg",
  },
  {
    name: "Men",
    slug: "men",
    description: "Modern looks for everyday style",
    image:
      "/images/men.jpeg",
  },
  {
    name: "Kids",
    slug: "kids",
    description: "Comfortable styles for little ones",
    image:
      "/images/kids.jpeg",
  },
  {
    name: "Shoes",
    slug: "shoes",
    description: "Step into your perfect pair",
    image:
      "/images/shoes.jpeg",
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Complete your look",
    image:
      "/images/accessories.jpeg",
  },
  {
    name: "Sale",
    slug: "sale",
    description: "Great styles at special prices",
    image:
      "/images/kcc.png",
  },
];

export default function ShopByCategory() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#c8a27a]">
              Explore
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Shop by Category
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
              Find the styles you love, from everyday essentials to something
              special.
            </p>
          </div>

          <Link
            href="/shop"
            className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-[#c8a27a]"
          >
            View all products
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={
                category.slug === "sale"
                  ? "/shop?sale=true"
                  : `/shop?category=${category.slug}`
              }
              className="group relative overflow-hidden rounded-2xl bg-gray-100"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                  <h3 className="text-xl font-semibold text-white sm:text-2xl">
                    {category.name}
                  </h3>

                  <p className="mt-1 hidden max-w-[220px] text-xs leading-5 text-white/85 sm:block">
                    {category.description}
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white sm:text-sm">
                    Shop now
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
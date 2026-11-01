import Image from "next/image";

export default function ShopHero() {
  return (
    <section className="relative h-[55vh] overflow-hidden">
      <Image
        src="/images/shop-banner.jpeg"
        alt="Shop"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative flex h-full items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-5 uppercase tracking-[0.45em] text-[var(--um-accent)]">
            Discover
          </p>

          <h1 className="text-6xl font-bold">
            Our Collection
          </h1>

          <p className="mt-5 text-lg text-gray-200">
            Crafted in Rwanda. Designed for the World.
          </p>
        </div>
      </div>
    </section>
  );
}
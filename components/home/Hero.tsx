import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/Container";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#fff8ed] via-[#f8eee4] to-[#f2e3d8]">
      <Container>

        <div className="grid items-center gap-10 py-10 lg:grid-cols-2">

          {/* Left */}

          <div>

            <span className="inline-flex rounded-full bg-[#7c3aed]/10 px-4 py-2 text-sm font-semibold text-[#6d28d9]">
              NEW ARRIVALS
            </span>

            <h1 className="mt-8 text-5xl font-bold leading-tight lg:text-6xl">
              Discover Fashion
              <br />
              Made For You.
            </h1>

            <p className="mt-6 max-w-lg text-lg text-gray-600">
              Explore clothing, shoes, bags and accessories for every
              occasion.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                href="/shop"
                className="rounded-full bg-[#6f1d1b] px-8 py-4 text-white shadow-lg shadow-[#6f1d1b]/20 transition hover:bg-[#a44a2f]"
              >
                Shop Now
              </Link>

              <Link
                href="/shop"
                className="rounded-full border border-[#d7bfa7] bg-white/70 px-8 py-4 transition hover:border-[var(--um-accent)] hover:bg-white"
              >
                Browse Products
              </Link>

            </div>

          </div>

          {/* Right */}

          <div className="relative h-[420px]">

            <Image
              src="/images/kcc.png"
              alt="Umwambaro Collection"
              fill
              priority
              className="rounded-3xl object-cover"
            />

          </div>

        </div>

      </Container>
    </section>
  );
}
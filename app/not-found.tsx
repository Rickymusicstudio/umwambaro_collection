import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-2 py-8 sm:px-4">
      <div className="rounded-lg bg-white p-8 text-center">
        <p className="text-5xl font-extrabold text-[#c8a27a]">404</p>
        <h1 className="mt-2 text-xl font-bold">We couldn&apos;t find that page</h1>
        <p className="mt-1 text-neutral-600">The product may be sold out or moved.</p>
        <Link href="/shop" className="mt-5 inline-block rounded-full bg-[#b3261e] text-white px-6 py-3 font-bold">Go to the shop</Link>
      </div>
    </div>
  );
}

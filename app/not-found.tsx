import Link from "next/link";
import Container from "@/components/layout/Container";

export default function NotFound() {
  return <main className="py-24"><Container><div className="mx-auto max-w-xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A14A]">404</p><h1 className="mt-3 text-4xl font-semibold">We couldn't find that page.</h1><p className="mt-4 text-neutral-600">The page or product may have moved.</p><Link href="/shop" className="mt-8 inline-flex rounded-xl bg-black px-6 py-3 font-semibold text-white">Go to Shop</Link></div></Container></main>;
}

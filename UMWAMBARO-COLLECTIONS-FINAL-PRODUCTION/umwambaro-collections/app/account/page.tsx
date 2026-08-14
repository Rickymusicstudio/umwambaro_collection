import Link from "next/link";
import Container from "@/components/layout/Container";

export default function AccountPage() {
  return <main className="bg-neutral-50 py-16"><Container><div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A14A]">Account</p><h1 className="mt-3 text-4xl font-semibold">Your account</h1><p className="mt-4 text-neutral-600">Account authentication will be connected to Supabase in the production phase.</p><Link href="/shop" className="mt-7 inline-flex rounded-xl bg-black px-6 py-3 font-semibold text-white">Continue Shopping</Link></div></Container></main>;
}

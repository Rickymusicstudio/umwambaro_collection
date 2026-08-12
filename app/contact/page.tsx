import Container from "@/components/layout/Container";

export default function ContactPage() {
  return <main className="bg-neutral-50 py-16"><Container><div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A14A]">Contact</p><h1 className="mt-3 text-4xl font-semibold">How can we help?</h1><p className="mt-4 leading-7 text-neutral-600">For product questions, orders, delivery, or returns, contact UMWAMBARO Collections.</p><div className="mt-8 space-y-4 rounded-2xl bg-neutral-50 p-6"><div><p className="text-sm text-neutral-500">Phone</p><p className="font-semibold">+250 7XX XXX XXX</p></div><div><p className="text-sm text-neutral-500">Email</p><p className="font-semibold">hello@umwambaro.com</p></div><div><p className="text-sm text-neutral-500">Location</p><p className="font-semibold">Kigali, Rwanda</p></div></div></div></Container></main>;
}

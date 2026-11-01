import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Container from "@/components/layout/Container";

const benefits = [
  { icon: Truck, title: "Fast Delivery", text: "Convenient delivery across Kigali and Rwanda." },
  { icon: ShieldCheck, title: "Secure Checkout", text: "A simple and safe checkout experience." },
  { icon: RotateCcw, title: "Easy Returns", text: "Support when an item isn't right for you." },
  { icon: Headphones, title: "Customer Support", text: "We're here to help before and after your order." },
];

export default function WhyChooseUs() {
  return (
    <section className="border-y border-neutral-200 bg-white py-16 sm:py-20">
      <Container>
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c8a27a]">Why shop with us</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Shopping made simple</h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-600">Good products, straightforward service, and a friendly shopping experience.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c8a27a]/10 text-[#c8a27a]"><Icon size={21} /></div>
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

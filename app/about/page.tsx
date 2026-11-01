import Link from "next/link";
import { Banknote, Recycle, Truck } from "lucide-react";
import { siteConfig } from "@/constants/site";

export const metadata = { title: "About · UMWAMBARO" };

export default function AboutPage() {
  const points = [
    { icon: Recycle, title: "New and Chaguwa", text: "Brand new clothes and carefully chosen second-hand (Chaguwa) pieces at fair prices." },
    { icon: Truck, title: "Delivery across Rwanda", text: "We deliver to all 30 districts. The fee is shown before you order." },
    { icon: Banknote, title: "Pay on delivery", text: "No card needed. Check your items and pay when they arrive." },
  ];
  return (
    <div className="mx-auto max-w-3xl px-2 py-4 sm:px-4">
      <section className="rounded-lg bg-white p-5 sm:p-8">
        <h1 className="text-2xl font-bold">About {siteConfig.fullName}</h1>
        <p className="mt-3 leading-7 text-neutral-700">
          {siteConfig.fullName} is a Rwandan clothing shop. We make it easy to find good clothes, shoes and accessories
          for the whole family, and to order them from your phone.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {points.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-lg border border-neutral-200 p-4">
              <Icon className="text-[#9e2a1f]" />
              <p className="mt-2 font-bold">{title}</p>
              <p className="mt-1 text-sm text-neutral-600">{text}</p>
            </div>
          ))}
        </div>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-[#b3261e] text-white px-6 py-3 font-bold">Start shopping</Link>
      </section>
    </div>
  );
}

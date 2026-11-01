import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/constants/site";
import { displayPhone } from "@/lib/format";

export const metadata = { title: "Contact · UMWAMBARO" };

export default function ContactPage() {
  const { contact } = siteConfig;
  const rows = [
    contact.phone && { icon: Phone, label: "Call us", value: displayPhone(contact.phone), href: `tel:+${contact.phone.replace(/\D/g, "")}` },
    contact.email && { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    contact.location && { icon: MapPin, label: "Location", value: contact.location },
    contact.hours && { icon: Clock, label: "Open", value: contact.hours },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <div className="mx-auto max-w-2xl space-y-3 px-2 py-4 sm:px-4">
      <section className="rounded-lg bg-white p-5 sm:p-8">
        <h1 className="text-2xl font-bold">Contact us</h1>
        <p className="mt-2 text-neutral-700">Questions about a product, an order or delivery? We are happy to help.</p>
        <ul className="mt-5 divide-y divide-neutral-200">
          {rows.map(({ icon: Icon, label, value, href }) => (
            <li key={label} className="flex items-center gap-3 py-3">
              <Icon className="text-[var(--um-strong)]" />
              <div>
                <p className="text-xs text-neutral-500">{label}</p>
                {href ? <a href={href} className="font-bold text-[var(--um-link)] hover:underline">{value}</a> : <p className="font-bold">{value}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-lg bg-white p-5 text-sm sm:p-8">
        <p className="font-bold">Already ordered?</p>
        <p className="mt-1 text-neutral-700">See where your order is with your order number and phone.</p>
        <Link href="/track" className="mt-3 inline-block rounded-full bg-[var(--um-cta)] text-[var(--um-cta-text)] px-5 py-2.5 font-bold">Track my order</Link>
      </section>
    </div>
  );
}

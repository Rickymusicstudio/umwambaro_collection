import Link from "next/link";
import { siteConfig, shopCategories } from "@/constants/site";
import { displayPhone } from "@/lib/format";

export default function Footer() {
  const { contact, social } = siteConfig;
  const socials = Object.entries(social).filter(([, url]) => url);

  return (
    <footer className="mt-10 bg-[var(--um-dark2)] pb-20 text-sm text-neutral-200 sm:pb-0">
      <a href="#top" className="block bg-[var(--um-dark2)] py-3 text-center font-medium text-white hover:bg-[#485769]">
        Back to top
      </a>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-extrabold text-white">{siteConfig.name}</p>
          <p className="mt-2 leading-6 text-neutral-300">{siteConfig.description}</p>
        </div>
        <div>
          <p className="mb-3 font-bold text-white">Shop</p>
          <ul className="space-y-2">
            {shopCategories.map((c) => (
              <li key={c.name}><Link className="hover:underline" href={`/shop?category=${encodeURIComponent(c.name)}`}>{c.name}</Link></li>
            ))}
            <li><Link className="hover:underline" href="/shop?condition=chaguwa">Chaguwa</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-bold text-white">Help</p>
          <ul className="space-y-2">
            <li><Link className="hover:underline" href="/track">Track your order</Link></li>
            <li><Link className="hover:underline" href="/account">Your account</Link></li>
            <li><Link className="hover:underline" href="/contact">Contact us</Link></li>
            <li><Link className="hover:underline" href="/about">About us</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-bold text-white">Contact</p>
          <ul className="space-y-2">
            {contact.phone && <li><a className="hover:underline" href={`tel:+${contact.phone.replace(/\D/g, "")}`}>{displayPhone(contact.phone)}</a></li>}
            {contact.email && <li><a className="hover:underline" href={`mailto:${contact.email}`}>{contact.email}</a></li>}
            {contact.location && <li>{contact.location}</li>}
            {contact.hours && <li className="text-neutral-400">{contact.hours}</li>}
            {socials.map(([name, url]) => (
              <li key={name}><a className="capitalize hover:underline" href={url} target="_blank" rel="noopener noreferrer">{name}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} {siteConfig.fullName} · Pay on delivery · Rwanda
      </div>
    </footer>
  );
}

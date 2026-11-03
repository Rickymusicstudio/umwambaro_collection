// ─────────────────────────────────────────────────────────────
//  Shop details shown to customers. Edit these values.
//  Leave a value empty ("") to hide it.
// ─────────────────────────────────────────────────────────────
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER ?? "";

export const siteConfig = {
  name: "UMWAMBARO",
  fullName: "Umwambaro Collections",
  tagline: "Fashion for everyone in Rwanda",
  description: "New and Chaguwa clothes, shoes and accessories. Pay on delivery anywhere in Rwanda.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.umwambarocollections.com", // used for shared links

  contact: {
    phone: whatsapp,                // shop phone (defaults to the WhatsApp order number)
    email: "",                      // e.g. "hello@umwambaro.rw"
    location: "Kigali, Rwanda",
    hours: "Mon – Sat, 8:00 – 19:00",
  },

  social: {
    instagram: "",                  // full links, e.g. "https://instagram.com/umwambaro"
    tiktok: "",
    facebook: "",
  },
};

// Main shop categories. `name` must match the Category typed in Admin → Products.
export const shopCategories = [
  { name: "Women", image: "/images/categories/women.webp" },
  { name: "Men", image: "/images/categories/men.webp" },
  { name: "Kids", image: "/images/categories/kids.webp" },
  { name: "Shoes", image: "/images/categories/shoes.webp" },
  { name: "Accessories", image: "/images/categories/accessories.webp" },
];

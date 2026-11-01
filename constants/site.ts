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
  { name: "Women", image: "/images/women.jpeg" },
  { name: "Men", image: "/images/men.jpeg" },
  { name: "Kids", image: "/images/kids.jpeg" },
  { name: "Shoes", image: "/images/shoes.jpeg" },
  { name: "Accessories", image: "/images/accessories.jpeg" },
];

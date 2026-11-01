// "RWF 15,000" everywhere in the shop.
export function rwf(value: number) {
  return `RWF ${new Intl.NumberFormat("en-RW").format(Math.round(value || 0))}`;
}

export function discountPercent(price: number, comparePrice?: number) {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

// 0788123456 / +250 788 123 456 → 250788123456
export function normalizeRwandaPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("250") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `250${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith("7")) return `250${digits}`;
  return digits;
}

export const isValidRwandaPhone = (phone: string) => /^2507[2389]\d{7}$/.test(normalizeRwandaPhone(phone));

// 250788123456 → 0788 123 456
export function displayPhone(phone: string) {
  const d = normalizeRwandaPhone(phone);
  if (d.length !== 12) return phone;
  const local = "0" + d.slice(3);
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

// UUID v4 that also works on plain http (e.g. testing on a phone over Wi-Fi).
export function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto && window.isSecureContext) return crypto.randomUUID();
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

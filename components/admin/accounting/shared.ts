// Types and helpers shared by the admin Accounting screens.

export type PayMethod = "cash" | "momo" | "bank" | "other";
export type EntryKind = "sale" | "income" | "expense";
export type DebtDirection = "owed_to_us" | "we_owe";

export type MoneyEntry = {
  id: string;
  entry_date: string;
  kind: EntryKind;
  category: string;
  description: string | null;
  amount: number;
  payment_method: PayMethod;
};

export type DebtPayment = { id: string; debt_id: string; amount: number; paid_on: string; payment_method: PayMethod; note: string | null };

export type Debt = {
  id: string;
  direction: DebtDirection;
  person_name: string;
  phone: string | null;
  description: string | null;
  amount: number;
  debt_date: string;
  due_date: string | null;
  debt_payments: DebtPayment[];
};

export type WebOrder = {
  id: string;
  order_number: string;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  total_amount: number;
  customer_name: string;
  created_at: string;
};

export type Period = { from: string; to: string };

export const payMethods: { value: PayMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "momo", label: "Mobile Money" },
  { value: "bank", label: "Bank" },
  { value: "other", label: "Other" },
];

export const categories: Record<EntryKind, string[]> = {
  sale: ["In-shop sale", "Phone / WhatsApp sale", "Market or event", "Other"],
  income: ["Owner capital", "Loan received", "Other"],
  expense: [
    "Stock purchase",
    "Rent",
    "Transport & delivery",
    "Salaries",
    "Marketing",
    "Phone & internet",
    "Electricity & water",
    "Taxes & fees",
    "Other",
  ],
};

export const methodLabel = (m: PayMethod) => payMethods.find((p) => p.value === m)?.label ?? m;

const kigaliDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kigali", year: "numeric", month: "2-digit", day: "2-digit" });

// "2026-11-01" for any timestamp, in Rwanda time.
export const dayOf = (iso: string | Date) => kigaliDay.format(typeof iso === "string" ? new Date(iso) : iso);
export const today = () => dayOf(new Date());

export const inPeriod = (day: string, p: Period) => (!p.from || day >= p.from) && (!p.to || day <= p.to);

export function presetPeriod(preset: "this_month" | "last_month" | "this_year" | "all"): Period {
  const [y, m] = today().split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const lastDay = (yy: number, mm: number) => new Date(yy, mm, 0).getDate();
  if (preset === "this_month") return { from: `${y}-${pad(m)}-01`, to: `${y}-${pad(m)}-${lastDay(y, m)}` };
  if (preset === "last_month") {
    const ly = m === 1 ? y - 1 : y;
    const lm = m === 1 ? 12 : m - 1;
    return { from: `${ly}-${pad(lm)}-01`, to: `${ly}-${pad(lm)}-${lastDay(ly, lm)}` };
  }
  if (preset === "this_year") return { from: `${y}-01-01`, to: `${y}-12-31` };
  return { from: "", to: "" };
}

export const paidOf = (d: Debt) => d.debt_payments.reduce((s, p) => s + p.amount, 0);
export const balanceOf = (d: Debt) => d.amount - paidOf(d);

export const shortDate = (day: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const inputClass =
  "h-11 w-full rounded-lg border border-[var(--um-line)] bg-white px-3 text-sm outline-none focus:border-[var(--um-cta)]";
export const cardClass = "rounded-lg border border-[var(--um-line)] bg-white shadow-sm";

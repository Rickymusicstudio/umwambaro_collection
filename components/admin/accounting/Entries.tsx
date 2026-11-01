"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { rwf } from "@/lib/format";
import {
  cardClass, categories, dayOf, inPeriod, inputClass, methodLabel, payMethods, shortDate, today,
  type EntryKind, type MoneyEntry, type PayMethod, type Period, type WebOrder,
} from "./shared";

const kindLabel: Record<EntryKind, string> = { sale: "Shop sale", income: "Other income", expense: "Expense" };

// "Sales & income" tab (kinds = sale + income) and "Expenses" tab (kinds = expense).
export default function Entries({ kinds, period, entries, orders, onChange }: {
  kinds: EntryKind[]; period: Period; entries: MoneyEntry[]; orders: WebOrder[]; onChange: () => Promise<void>;
}) {
  const isExpense = kinds.includes("expense");
  const blank = { kind: kinds[0], entry_date: today(), category: categories[kinds[0]][0], description: "", amount: "", payment_method: "cash" as PayMethod };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const rows = useMemo(() => entries.filter((e) => kinds.includes(e.kind) && inPeriod(e.entry_date, period)), [entries, kinds, period]);
  const webSales = useMemo(
    () => (isExpense ? [] : orders.filter((o) => o.status === "delivered" && inPeriod(dayOf(o.created_at), period))),
    [orders, period, isExpense]
  );
  const total = rows.reduce((s, e) => s + e.amount, 0) + webSales.reduce((s, o) => s + o.total_amount, 0);

  async function save(e: FormEvent) {
    e.preventDefault();
    const amount = Math.round(Number(form.amount));
    if (!amount || amount <= 0) { setError("Enter an amount above 0."); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true); setError("");
    const { error } = await supabase.from("money_entries").insert({
      kind: form.kind, entry_date: form.entry_date, category: form.category,
      description: form.description.trim() || null, amount, payment_method: form.payment_method,
    });
    if (error) { setError(error.message); setSaving(false); return; }
    setForm({ ...blank, kind: form.kind, category: form.category, entry_date: form.entry_date, payment_method: form.payment_method });
    await onChange();
    setSaving(false);
  }

  async function remove(entry: MoneyEntry) {
    if (!confirm(`Delete this ${kindLabel[entry.kind].toLowerCase()} of ${rwf(entry.amount)}?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase.from("money_entries").delete().eq("id", entry.id);
    if (error) { alert(error.message); return; }
    await onChange();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <form onSubmit={save} className={`${cardClass} h-fit space-y-3 p-4`}>
        <h2 className="flex items-center gap-2 font-semibold"><Plus size={18} /> {isExpense ? "Record an expense" : "Record a sale or income"}</h2>
        {!isExpense && (
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-[var(--um-soft)] p-1">
            {kinds.map((k) => (
              <button type="button" key={k} onClick={() => setForm({ ...form, kind: k, category: categories[k][0] })}
                className={`rounded-md py-2 text-sm font-semibold ${form.kind === k ? "bg-white shadow-sm" : "text-neutral-600"}`}>
                {kindLabel[k]}
              </button>
            ))}
          </div>
        )}
        <Field label="Amount (RWF)">
          <input required type="number" min={1} inputMode="numeric" value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} placeholder="e.g. 15000" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input required type="date" value={form.entry_date} max={today()} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Paid with">
            <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value as PayMethod })} className={inputClass}>
              {payMethods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Category">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
            {categories[form.kind].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Details (optional)">
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass}
            placeholder={isExpense ? "e.g. 2 bales of Chaguwa from Kimironko" : "e.g. 2 dresses, sold to Aline"} />
        </Field>
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <button disabled={saving} className="w-full rounded-full bg-[var(--um-cta)] py-2.5 text-sm font-bold text-[var(--um-cta-text)] hover:bg-[var(--um-cta-hover)] disabled:opacity-60">
          {saving ? "Saving…" : "Save"}
        </button>
      </form>

      <section className={cardClass}>
        <div className="flex items-center justify-between border-b border-[var(--um-line)] p-4">
          <h2 className="font-semibold">{isExpense ? "Expenses" : "Sales & income"} in this period</h2>
          <p className={`text-lg font-bold ${isExpense ? "text-red-700" : "text-emerald-700"}`}>{rwf(total)}</p>
        </div>
        {rows.length === 0 && webSales.length === 0 ? <p className="p-8 text-center text-sm text-neutral-500">Nothing recorded in this period.</p> : (
          <ul className="divide-y divide-[var(--um-line)]">
            {rows.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{e.category}{e.kind === "income" && <span className="ml-2 rounded-full bg-[var(--um-soft)] px-2 py-0.5 text-xs">Other income</span>}</p>
                  {e.description && <p className="text-sm text-neutral-600">{e.description}</p>}
                  <p className="text-xs text-neutral-500">{shortDate(e.entry_date)} · {methodLabel(e.payment_method)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-semibold">{rwf(e.amount)}</span>
                  <button onClick={() => remove(e)} aria-label="Delete" className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
            {webSales.map((o) => (
              <li key={o.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium">Website order {o.order_number}<span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Delivered</span></p>
                  <p className="text-sm text-neutral-600">{o.customer_name}</p>
                  <p className="text-xs text-neutral-500">{shortDate(dayOf(o.created_at))} · Cash on delivery</p>
                </div>
                <span className="shrink-0 font-semibold">{rwf(o.total_amount)}</span>
              </li>
            ))}
          </ul>
        )}
        {!isExpense && (
          <p className="border-t border-[var(--um-line)] p-3 text-xs text-neutral-500">
            Website orders are added automatically once you mark them <strong>Delivered</strong> in <Link href="/admin/orders" className="underline">Orders</Link>.
          </p>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">{label}</span>{children}</label>;
}

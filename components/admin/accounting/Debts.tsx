"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { HandCoins, Phone, Plus, Trash2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { displayPhone, rwf } from "@/lib/format";
import {
  balanceOf, cardClass, inputClass, methodLabel, paidOf, payMethods, shortDate, today,
  type Debt, type DebtDirection, type PayMethod,
} from "./shared";

const sides: { key: DebtDirection; label: string; hint: string }[] = [
  { key: "owed_to_us", label: "Customers owe you", hint: "Abakugomba – goods taken now, paid later" },
  { key: "we_owe", label: "You owe", hint: "Ibyo ugomba kwishyura – suppliers or others you will pay" },
];

export default function Debts({ debts, onChange }: { debts: Debt[]; onChange: () => Promise<void> }) {
  const [side, setSide] = useState<DebtDirection>("owed_to_us");
  const [show, setShow] = useState<"open" | "paid" | "all">("open");
  const blank = { person_name: "", phone: "", description: "", amount: "", debt_date: today(), due_date: "" };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const mine = useMemo(() => debts.filter((d) => d.direction === side), [debts, side]);
  const list = useMemo(() => mine
    .filter((d) => show === "all" || (show === "open" ? balanceOf(d) > 0 : balanceOf(d) <= 0))
    // soonest "pay by" date first, then newest
    .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999") || b.debt_date.localeCompare(a.debt_date)),
  [mine, show]);
  const outstanding = mine.reduce((s, d) => s + Math.max(0, balanceOf(d)), 0);

  async function add(e: FormEvent) {
    e.preventDefault();
    const amount = Math.round(Number(form.amount));
    if (!form.person_name.trim()) { setError("Enter a name."); return; }
    if (!amount || amount <= 0) { setError("Enter an amount above 0."); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true); setError("");
    const { error } = await supabase.from("debts").insert({
      direction: side, person_name: form.person_name.trim(), phone: form.phone.trim() || null,
      description: form.description.trim() || null, amount, debt_date: form.debt_date, due_date: form.due_date || null,
    });
    if (error) { setError(error.message); setSaving(false); return; }
    setForm(blank);
    await onChange();
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {sides.map((s) => {
          const total = debts.filter((d) => d.direction === s.key).reduce((sum, d) => sum + Math.max(0, balanceOf(d)), 0);
          return (
            <button key={s.key} onClick={() => setSide(s.key)}
              className={`rounded-lg border-2 p-4 text-left ${side === s.key ? "border-[var(--um-dark2)] bg-white shadow-sm" : "border-transparent bg-white/60"}`}>
              <p className="text-sm font-semibold text-neutral-600">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${s.key === "owed_to_us" ? "text-emerald-700" : "text-red-700"}`}>{rwf(total)}</p>
              <p className="mt-1 text-xs text-neutral-500">{s.hint}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <form onSubmit={add} className={`${cardClass} h-fit space-y-3 p-4`}>
          <h2 className="flex items-center gap-2 font-semibold"><Plus size={18} /> New ideni – {side === "owed_to_us" ? "someone owes you" : "you owe someone"}</h2>
          <Field label={side === "owed_to_us" ? "Customer name" : "Who you owe"}>
            <input required value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (RWF)">
              <input required type="number" min={1} inputMode="numeric" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Phone (optional)">
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="0788 123 456" />
            </Field>
            <Field label="Date">
              <input required type="date" value={form.debt_date} onChange={(e) => setForm({ ...form, debt_date: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Pay by (optional)">
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label="What for (optional)">
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass}
              placeholder={side === "owed_to_us" ? "e.g. 1 dress + 1 pair of shoes" : "e.g. 3 bales from supplier"} />
          </Field>
          {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
          <button disabled={saving} className="w-full rounded-full bg-[var(--um-cta)] py-2.5 text-sm font-bold text-[var(--um-cta-text)] hover:bg-[var(--um-cta-hover)] disabled:opacity-60">
            {saving ? "Saving…" : "Save ideni"}
          </button>
        </form>

        <section className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--um-line)] p-4">
            <div>
              <h2 className="font-semibold">{sides.find((s) => s.key === side)?.label}</h2>
              <p className="text-sm text-neutral-500">Still to pay: <strong>{rwf(outstanding)}</strong></p>
            </div>
            <div className="flex gap-1 rounded-lg bg-[var(--um-soft)] p-1 text-xs font-semibold">
              {(["open", "paid", "all"] as const).map((k) => (
                <button key={k} onClick={() => setShow(k)} className={`rounded-md px-3 py-1.5 capitalize ${show === k ? "bg-white shadow-sm" : "text-neutral-600"}`}>
                  {k === "open" ? "Not paid" : k === "paid" ? "Paid" : "All"}
                </button>
              ))}
            </div>
          </div>
          {list.length === 0 ? <p className="p-8 text-center text-sm text-neutral-500">No amadeni here.</p> : (
            <ul className="divide-y divide-[var(--um-line)]">
              {list.map((d) => <DebtRow key={d.id} debt={d} onChange={onChange} />)}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function DebtRow({ debt, onChange }: { debt: Debt; onChange: () => Promise<void> }) {
  const [paying, setPaying] = useState(false);
  const [pay, setPay] = useState({ amount: "", paid_on: today(), payment_method: "cash" as PayMethod });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const paid = paidOf(debt);
  const balance = balanceOf(debt);
  const overdue = balance > 0 && debt.due_date && debt.due_date < today();

  async function savePayment(e: FormEvent) {
    e.preventDefault();
    const amount = Math.round(Number(pay.amount));
    if (!amount || amount <= 0) { setError("Enter an amount above 0."); return; }
    if (amount > balance) { setError(`Only ${rwf(balance)} is left.`); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true); setError("");
    const { error } = await supabase.from("debt_payments").insert({ debt_id: debt.id, amount, paid_on: pay.paid_on, payment_method: pay.payment_method });
    if (error) { setError(error.message); setBusy(false); return; }
    setPaying(false);
    setPay({ amount: "", paid_on: today(), payment_method: "cash" });
    await onChange();
    setBusy(false);
  }

  async function remove() {
    if (!confirm(`Delete the ideni of ${debt.person_name} (${rwf(debt.amount)}) and its payments?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase.from("debts").delete().eq("id", debt.id);
    if (error) { alert(error.message); return; }
    await onChange();
  }

  return (
    <li className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{debt.person_name}
            {balance <= 0 && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Paid</span>}
            {overdue && <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">Late</span>}
          </p>
          {debt.description && <p className="text-sm text-neutral-600">{debt.description}</p>}
          <p className="text-xs text-neutral-500">
            {shortDate(debt.debt_date)}{debt.due_date && ` · pay by ${shortDate(debt.due_date)}`}
            {debt.phone && <> · <a href={`tel:${debt.phone}`} className="inline-flex items-center gap-0.5 underline"><Phone size={11} /> {displayPhone(debt.phone)}</a></>}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bold">{rwf(Math.max(0, balance))}</p>
          <p className="text-xs text-neutral-500">of {rwf(debt.amount)}</p>
        </div>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.min(100, (paid / debt.amount) * 100)}%` }} />
      </div>

      {debt.debt_payments.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-neutral-500">
          {[...debt.debt_payments].sort((a, b) => a.paid_on.localeCompare(b.paid_on)).map((p) => (
            <li key={p.id}>Paid {rwf(p.amount)} on {shortDate(p.paid_on)} · {methodLabel(p.payment_method)}</li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {balance > 0 && !paying && (
          <button onClick={() => { setPaying(true); setPay({ ...pay, amount: String(balance) }); }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--um-dark2)] px-3 py-1.5 text-xs font-semibold text-white">
            <HandCoins size={14} /> Record payment
          </button>
        )}
        <button onClick={remove} className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-neutral-500 hover:bg-red-50 hover:text-red-700">
          <Trash2 size={14} /> Delete
        </button>
      </div>

      {paying && (
        <form onSubmit={savePayment} className="mt-3 grid gap-2 rounded-lg bg-[var(--um-soft)] p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <Field label="Amount paid"><input type="number" min={1} max={balance} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} className={inputClass} /></Field>
          <Field label="Date"><input type="date" value={pay.paid_on} onChange={(e) => setPay({ ...pay, paid_on: e.target.value })} className={inputClass} /></Field>
          <Field label="Paid with">
            <select value={pay.payment_method} onChange={(e) => setPay({ ...pay, payment_method: e.target.value as PayMethod })} className={inputClass}>
              {payMethods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
          <div className="flex gap-2">
            <button disabled={busy} className="h-11 rounded-lg bg-[var(--um-cta)] px-4 text-sm font-bold text-[var(--um-cta-text)] disabled:opacity-60">{busy ? "…" : "Save"}</button>
            <button type="button" onClick={() => { setPaying(false); setError(""); }} className="h-11 rounded-lg px-3 text-sm text-neutral-600">Cancel</button>
          </div>
          {error && <p className="text-sm text-red-700 sm:col-span-4">{error}</p>}
        </form>
      )}
    </li>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">{label}</span>{children}</label>;
}

"use client";

import { useMemo } from "react";
import { ArrowDownCircle, ArrowUpCircle, Download, HandCoins, Scale, Truck, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import StatCard from "@/components/admin/StatCard";
import { rwf } from "@/lib/format";
import {
  balanceOf, cardClass, dayOf, downloadCsv, inPeriod, methodLabel, today,
  type Debt, type MoneyEntry, type Period, type WebOrder,
} from "./shared";

type Movement = { day: string; type: string; detail: string; method: string; moneyIn: number; moneyOut: number };

export default function Overview({ period, orders, entries, debts }: { period: Period; orders: WebOrder[]; entries: MoneyEntry[]; debts: Debt[] }) {
  // Every money movement, newest first. Website orders count once delivered (cash on delivery).
  const movements = useMemo<Movement[]>(() => {
    const list: Movement[] = [];
    for (const o of orders) {
      if (o.status === "delivered") list.push({ day: dayOf(o.created_at), type: "Website sale", detail: `${o.order_number} · ${o.customer_name}`, method: "Cash on delivery", moneyIn: o.total_amount, moneyOut: 0 });
    }
    for (const e of entries) {
      const type = e.kind === "sale" ? "Shop sale" : e.kind === "income" ? "Other income" : "Expense";
      const detail = [e.category, e.description].filter(Boolean).join(" · ");
      list.push({ day: e.entry_date, type, detail, method: methodLabel(e.payment_method), moneyIn: e.kind === "expense" ? 0 : e.amount, moneyOut: e.kind === "expense" ? e.amount : 0 });
    }
    for (const d of debts) {
      for (const p of d.debt_payments) {
        const theyPaid = d.direction === "owed_to_us";
        list.push({ day: p.paid_on, type: theyPaid ? "Ideni paid to you" : "Ideni you paid", detail: d.person_name, method: methodLabel(p.payment_method), moneyIn: theyPaid ? p.amount : 0, moneyOut: theyPaid ? 0 : p.amount });
      }
    }
    return list.sort((a, b) => b.day.localeCompare(a.day));
  }, [orders, entries, debts]);

  const inRange = useMemo(() => movements.filter((m) => inPeriod(m.day, period)), [movements, period]);

  const totals = useMemo(() => {
    const sum = (f: (m: Movement) => boolean, k: "moneyIn" | "moneyOut") => inRange.filter(f).reduce((s, m) => s + m[k], 0);
    return {
      website: sum((m) => m.type === "Website sale", "moneyIn"),
      shop: sum((m) => m.type === "Shop sale", "moneyIn"),
      other: sum((m) => m.type === "Other income", "moneyIn"),
      debtIn: sum((m) => m.type === "Ideni paid to you", "moneyIn"),
      expenses: sum((m) => m.type === "Expense", "moneyOut"),
      debtOut: sum((m) => m.type === "Ideni you paid", "moneyOut"),
      moneyIn: inRange.reduce((s, m) => s + m.moneyIn, 0),
      moneyOut: inRange.reduce((s, m) => s + m.moneyOut, 0),
    };
  }, [inRange]);

  const toCollect = orders.filter((o) => o.status === "pending" || o.status === "confirmed").reduce((s, o) => s + o.total_amount, 0);
  const openDebts = debts.filter((d) => balanceOf(d) > 0);
  const theyOwe = openDebts.filter((d) => d.direction === "owed_to_us").reduce((s, d) => s + balanceOf(d), 0);
  const weOwe = openDebts.filter((d) => d.direction === "we_owe").reduce((s, d) => s + balanceOf(d), 0);
  const overdue = openDebts.filter((d) => d.due_date && d.due_date < today()).length;

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) if (e.kind === "expense" && inPeriod(e.entry_date, period)) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [entries, period]);

  // Last 12 months, money in vs out.
  const monthly = useMemo(() => {
    const months: { key: string; label: string; in: number; out: number }[] = [];
    const [y, m] = today().split("-").map(Number);
    for (let i = 11; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, label: d.toLocaleDateString("en-GB", { month: "short" }), in: 0, out: 0 });
    }
    for (const mv of movements) {
      const row = months.find((x) => x.key === mv.day.slice(0, 7));
      if (row) { row.in += mv.moneyIn; row.out += mv.moneyOut; }
    }
    return months;
  }, [movements]);

  const profit = totals.moneyIn - totals.moneyOut;

  function exportCsv() {
    downloadCsv(`umwambaro-accounting-${period.from || "start"}-to-${period.to || today()}.csv`, [
      ["Date", "Type", "Details", "Paid with", "Money in (RWF)", "Money out (RWF)"],
      ...inRange.map((m) => [m.day, m.type, m.detail, m.method, m.moneyIn || "", m.moneyOut || ""]),
      [],
      ["", "", "", "Totals", totals.moneyIn, totals.moneyOut],
      ["", "", "", "Profit", profit, ""],
    ]);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Money in" value={rwf(totals.moneyIn)} hint="Sales, income, amadeni paid" icon={<ArrowDownCircle size={20} />} />
        <StatCard label="Money out" value={rwf(totals.moneyOut)} hint="Expenses, amadeni you paid" icon={<ArrowUpCircle size={20} />} />
        <StatCard label={profit >= 0 ? "Profit" : "Loss"} value={rwf(Math.abs(profit))} hint="Money in − money out" icon={<Scale size={20} />} />
        <StatCard label="To collect" value={rwf(toCollect)} hint="Website orders not yet delivered" icon={<Truck size={20} />} />
        <StatCard label="Customers owe you" value={rwf(theyOwe)} hint={`${openDebts.filter((d) => d.direction === "owed_to_us").length} open amadeni`} icon={<HandCoins size={20} />} />
        <StatCard label="You owe" value={rwf(weOwe)} hint={overdue ? `${overdue} ideni overdue` : "Nothing overdue"} icon={<Wallet size={20} />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <section className={`${cardClass} p-4`}>
          <h2 className="font-semibold">Last 12 months</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={56}
                  tickFormatter={(v: number) => (v >= 1_000_000 ? `${v / 1_000_000}M` : v >= 1000 ? `${v / 1000}k` : String(v))} />
                <Tooltip formatter={(v) => rwf(Number(v))} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="in" name="Money in" fill="var(--um-dark2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" name="Money out" fill="var(--um-cta)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={`${cardClass} p-4`}>
          <h2 className="font-semibold">Where the money came from</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Website sales (delivered)" value={totals.website} />
            <Row label="Shop sales" value={totals.shop} />
            <Row label="Other income" value={totals.other} />
            <Row label="Amadeni paid to you" value={totals.debtIn} />
          </dl>
          <h2 className="mt-5 font-semibold">Where it went</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {expenseByCategory.length === 0 && <p className="text-neutral-500">No expenses in this period.</p>}
            {expenseByCategory.map(([cat, amount]) => <Row key={cat} label={cat} value={amount} />)}
            {totals.debtOut > 0 && <Row label="Amadeni you paid" value={totals.debtOut} />}
          </dl>
        </section>
      </div>

      <section className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--um-line)] p-4">
          <div>
            <h2 className="font-semibold">All money movements</h2>
            <p className="text-sm text-neutral-500">{inRange.length} in this period</p>
          </div>
          <button onClick={exportCsv} disabled={!inRange.length}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--um-line)] px-3 py-2 text-sm font-semibold hover:bg-[var(--um-soft)] disabled:opacity-50">
            <Download size={16} /> Download (Excel)
          </button>
        </div>
        {inRange.length === 0 ? <p className="p-8 text-center text-sm text-neutral-500">Nothing recorded in this period.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[var(--um-soft)] text-left text-xs uppercase tracking-wide text-neutral-600">
                <th className="px-4 py-2">Date</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Details</th><th className="px-4 py-2">Paid with</th>
                <th className="px-4 py-2 text-right">In</th><th className="px-4 py-2 text-right">Out</th>
              </tr></thead>
              <tbody className="divide-y divide-[var(--um-line)]">
                {inRange.slice(0, 200).map((m, i) => (
                  <tr key={i}>
                    <td className="whitespace-nowrap px-4 py-2 text-neutral-600">{m.day}</td>
                    <td className="whitespace-nowrap px-4 py-2 font-medium">{m.type}</td>
                    <td className="px-4 py-2 text-neutral-600">{m.detail}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-neutral-600">{m.method}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-right font-semibold text-emerald-700">{m.moneyIn ? rwf(m.moneyIn) : ""}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-right font-semibold text-red-700">{m.moneyOut ? rwf(m.moneyOut) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inRange.length > 200 && <p className="p-3 text-center text-xs text-neutral-500">Showing the latest 200. Download to see all.</p>}
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-neutral-600">{label}</dt>
      <dd className="font-semibold">{rwf(value)}</dd>
    </div>
  );
}

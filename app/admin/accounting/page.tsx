"use client";

import { useCallback, useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import Overview from "@/components/admin/accounting/Overview";
import Entries from "@/components/admin/accounting/Entries";
import Debts from "@/components/admin/accounting/Debts";
import { presetPeriod, type Debt, type MoneyEntry, type Period, type WebOrder } from "@/components/admin/accounting/shared";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "sales", label: "Sales & income" },
  { key: "expenses", label: "Expenses" },
  { key: "debts", label: "Amadeni" },
] as const;
type Tab = (typeof tabs)[number]["key"];

const presets = [
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "this_year", label: "This year" },
  { key: "all", label: "All time" },
] as const;

function fetchAccounting() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return new Promise<never>(() => {});
  return Promise.all([
    supabase.from("orders").select("id, order_number, status, total_amount, customer_name, created_at").neq("status", "cancelled").order("created_at", { ascending: false }),
    supabase.from("money_entries").select("*").order("entry_date", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("debts").select("*, debt_payments(*)").order("debt_date", { ascending: false }),
  ]);
}

export default function AccountingPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [preset, setPreset] = useState<string>("this_month");
  const [period, setPeriod] = useState<Period>(presetPeriod("this_month"));
  const [orders, setOrders] = useState<WebOrder[]>([]);
  const [entries, setEntries] = useState<MoneyEntry[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apply = useCallback(([o, e, d]: Awaited<ReturnType<typeof fetchAccounting>>) => {
    if (e.error || d.error) setError("Accounting is not set up yet. Run database/ACCOUNTING_SETUP.sql in the Supabase SQL Editor, then reload this page.");
    else setError("");
    setOrders((o.data ?? []) as WebOrder[]);
    setEntries((e.data ?? []) as MoneyEntry[]);
    setDebts((d.data ?? []) as Debt[]);
    setLoading(false);
  }, []);

  const load = useCallback(async () => { apply(await fetchAccounting()); }, [apply]);

  useEffect(() => { void fetchAccounting().then(apply); }, [apply]);

  function choosePreset(key: (typeof presets)[number]["key"]) {
    setPreset(key);
    setPeriod(presetPeriod(key));
  }

  return (
    <>
      <AdminHeader title="Accounting" description="Sales, income, expenses and amadeni in one place." />
      <div className="mx-auto max-w-7xl space-y-4 px-3 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 overflow-x-auto rounded-lg bg-white p-1 shadow-sm no-scrollbar">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${tab === t.key ? "bg-[var(--um-dark2)] text-white" : "text-neutral-600 hover:bg-[var(--um-soft)]"}`}>
                {t.label}
              </button>
            ))}
          </div>
          {tab !== "debts" && (
            <div className="flex flex-wrap items-center gap-1 sm:ml-auto">
              {presets.map((p) => (
                <button key={p.key} onClick={() => choosePreset(p.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${preset === p.key ? "border-[var(--um-dark2)] bg-[var(--um-dark2)] text-white" : "border-[var(--um-line)] bg-white text-neutral-700"}`}>
                  {p.label}
                </button>
              ))}
              <input type="date" aria-label="From" value={period.from} onChange={(e) => { setPreset("custom"); setPeriod({ ...period, from: e.target.value }); }}
                className="h-8 rounded-lg border border-[var(--um-line)] bg-white px-2 text-xs" />
              <span className="text-xs text-neutral-500">to</span>
              <input type="date" aria-label="To" value={period.to} onChange={(e) => { setPreset("custom"); setPeriod({ ...period, to: e.target.value }); }}
                className="h-8 rounded-lg border border-[var(--um-line)] bg-white px-2 text-xs" />
            </div>
          )}
        </div>

        {!getSupabaseBrowserClient() && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Supabase is not configured.</p>}
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {loading ? <p className="py-16 text-center text-sm text-neutral-500">Loading…</p> : (
          <>
            {tab === "overview" && <Overview period={period} orders={orders} entries={entries} debts={debts} />}
            {tab === "sales" && <Entries kinds={["sale", "income"]} period={period} entries={entries} orders={orders} onChange={load} />}
            {tab === "expenses" && <Entries kinds={["expense"]} period={period} entries={entries} orders={orders} onChange={load} />}
            {tab === "debts" && <Debts debts={debts} onChange={load} />}
          </>
        )}
      </div>
    </>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Truck } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { siteConfig } from "@/constants/site";
import { displayPhone, rwf } from "@/lib/format";

type Zone = { district: string; province: string; fee: number; active: boolean; sort: number };

export default function AdminSettingsPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [saved, setSaved] = useState<Record<string, Zone>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [bulk, setBulk] = useState({ province: "Kigali", fee: "" });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setError("Supabase is not configured."); setLoading(false); return; }
    supabase.from("delivery_zones").select("*").order("sort").then(({ data, error }) => {
      if (error) setError("Could not load delivery fees. Run the latest database script (UMWAMBARO_FINAL_RESTORE.sql) in Supabase.");
      const rows = (data ?? []) as Zone[];
      setZones(rows);
      setSaved(Object.fromEntries(rows.map((z) => [z.district, z])));
      setLoading(false);
    });
  }, []);

  const changed = useMemo(
    () => zones.filter((z) => saved[z.district] && (saved[z.district].fee !== z.fee || saved[z.district].active !== z.active)),
    [zones, saved]
  );
  const provinces = useMemo(() => [...new Set(zones.map((z) => z.province))], [zones]);

  const update = (district: string, patch: Partial<Zone>) =>
    setZones((list) => list.map((z) => (z.district === district ? { ...z, ...patch } : z)));

  function applyBulk() {
    const fee = Math.max(0, Math.round(Number(bulk.fee)));
    if (bulk.fee === "" || Number.isNaN(fee)) return;
    setZones((list) => list.map((z) => (z.province === bulk.province ? { ...z, fee } : z)));
  }

  async function save() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !changed.length) return;
    setSaving(true); setError(""); setMessage("");
    for (const z of changed) {
      const { error } = await supabase.from("delivery_zones").update({ fee: z.fee, active: z.active }).eq("district", z.district);
      if (error) { setError(`${z.district}: ${error.message}`); setSaving(false); return; }
    }
    setSaved(Object.fromEntries(zones.map((z) => [z.district, z])));
    setMessage(`Saved ${changed.length} district${changed.length === 1 ? "" : "s"}. Customers see the new fees right away.`);
    setSaving(false);
  }

  const { contact } = siteConfig;

  return (
    <>
      <AdminHeader title="Settings" description="Delivery fees and store information." />
      <div className="mx-auto max-w-5xl space-y-4 px-3 py-4 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold"><Truck size={20} className="text-[#9e2a1f]" /> Delivery fees</h2>
              <p className="text-sm text-neutral-500">The fee customers pay for each district. Set 0 for free delivery. Turn a district off to stop delivering there.</p>
            </div>
            <button onClick={save} disabled={!changed.length || saving}
              className="rounded-full bg-[#b3261e] text-white px-5 py-2.5 text-sm font-bold hover:bg-[#8f1d17] disabled:opacity-50">
              {saving ? "Saving…" : changed.length ? `Save ${changed.length} change${changed.length === 1 ? "" : "s"}` : "Saved"}
            </button>
          </div>

          {provinces.length > 0 && (
            <div className="mt-4 flex flex-wrap items-end gap-2 rounded-lg bg-[#f7efe4] p-3 text-sm">
              <span className="font-semibold">Quick set:</span>
              <select value={bulk.province} onChange={(e) => setBulk({ ...bulk, province: e.target.value })} className="h-10 rounded-lg border border-[#bfae98] bg-white px-2">
                {provinces.map((p) => <option key={p}>{p}</option>)}
              </select>
              <input type="number" min={0} step={500} inputMode="numeric" placeholder="Fee (RWF)" value={bulk.fee}
                onChange={(e) => setBulk({ ...bulk, fee: e.target.value })} className="h-10 w-32 rounded-lg border border-[#bfae98] bg-white px-2" />
              <button onClick={applyBulk} className="h-10 rounded-lg bg-[#4a2c1d] px-4 font-semibold text-white">Apply to all</button>
            </div>
          )}

          {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"><Check size={16} /> {message}</p>}

          {loading ? <p className="py-8 text-center text-sm text-neutral-500">Loading…</p> : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-[#c9d4db]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#f7efe4] text-left text-xs uppercase tracking-wide text-neutral-600">
                    <th className="border border-[#e3d5c3] px-3 py-2">Province</th>
                    <th className="border border-[#e3d5c3] px-3 py-2">District</th>
                    <th className="border border-[#e3d5c3] px-3 py-2">Fee (RWF)</th>
                    <th className="border border-[#e3d5c3] px-3 py-2">Delivering</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((z) => {
                    const dirty = saved[z.district] && (saved[z.district].fee !== z.fee || saved[z.district].active !== z.active);
                    return (
                      <tr key={z.district} className={dirty ? "bg-[#fffaf2]" : ""}>
                        <td className="border border-[#e3d5c3] px-3 py-2 text-neutral-600">{z.province}</td>
                        <td className="border border-[#e3d5c3] px-3 py-2 font-semibold">{z.district}</td>
                        <td className="border border-[#e3d5c3] px-3 py-1.5">
                          <input type="number" min={0} step={500} inputMode="numeric" value={z.fee}
                            onChange={(e) => update(z.district, { fee: Math.max(0, Math.round(Number(e.target.value) || 0)) })}
                            className="h-9 w-28 rounded border border-[#bfae98] px-2 focus:border-[#b3261e] focus:outline-none" />
                          <span className="ml-2 text-xs text-neutral-500">{z.fee ? rwf(z.fee) : "Free"}</span>
                        </td>
                        <td className="border border-[#e3d5c3] px-3 py-2">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={z.active} onChange={(e) => update(z.district, { active: e.target.checked })} className="h-5 w-5 accent-[#9e2a1f]" />
                            {z.active ? "Yes" : "No"}
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold">Store information</h2>
          <p className="text-sm text-neutral-500">Shown on the Contact page and footer. To change it, edit <code className="rounded bg-neutral-100 px-1">constants/site.ts</code>.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Setting label="Store name" value={siteConfig.fullName} />
            <Setting label="Phone / WhatsApp for orders" value={contact.phone ? displayPhone(contact.phone) : "Not set (.env.local)"} />
            <Setting label="Email" value={contact.email || "Not set"} />
            <Setting label="Location" value={contact.location || "Not set"} />
            <Setting label="Payment" value="Cash on delivery" />
            <Setting label="Currency" value="RWF" />
          </div>
        </section>

        <section className="rounded-lg border border-[#c8a27a] bg-[#fffaf2] p-4 text-sm leading-6 text-[#5a3220] sm:p-6">
          <h2 className="font-bold">How orders work</h2>
          <ul className="mt-2 space-y-1">
            <li>• Prices, stock and delivery fees are checked by the database when the customer orders.</li>
            <li>• After ordering, WhatsApp opens on the customer&apos;s phone with the order ready to send to your number.</li>
            <li>• Every order is also saved here under <strong>Orders</strong>, even if the customer doesn&apos;t press Send.</li>
            <li>• Cancelling an order puts the items back in stock automatically.</li>
          </ul>
        </section>
      </div>
    </>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f7efe4] p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

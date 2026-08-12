import type { ReactNode } from "react";

export default function StatCard({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
        </div>
        <div className="rounded-xl bg-[#C9A14A]/10 p-3 text-[#9b792d]">{icon}</div>
      </div>
    </div>
  );
}

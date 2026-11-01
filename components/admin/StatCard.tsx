import type { ReactNode } from "react";

export default function StatCard({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon: ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="mt-1 text-xl font-bold tracking-tight sm:mt-2 sm:text-3xl">{value}</p>
          {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
        </div>
        <div className="hidden rounded-xl bg-[var(--um-strong)]/10 p-3 text-[var(--um-strong)] sm:block">{icon}</div>
      </div>
    </div>
  );
}

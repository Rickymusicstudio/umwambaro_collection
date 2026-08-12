"use client";

import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminHeader({ title, description }: { title: string; description?: string }) {
  const router = useRouter();

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A14A]">UMWAMBARO ADMIN</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" target="_blank" className="hidden items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-50 sm:inline-flex">
            View store <ExternalLink size={16} />
          </Link>
          <button type="button" onClick={signOut} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-50">
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

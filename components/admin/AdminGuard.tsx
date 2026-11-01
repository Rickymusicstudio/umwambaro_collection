"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const VERIFY_TIMEOUT_MS = 8000;

function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "Admin verification timed out. Please try again."
            )
          ),
        ms,
      )
    ),
  ]);
}

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "ready" | "denied" | "setup" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | null = null;

    async function verifyAdmin() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (!cancelled) setStatus("setup");
        return;
      }

      try {
        const { data: sessionData } = await withTimeout(supabase.auth.getSession(), VERIFY_TIMEOUT_MS);
        if (cancelled) return;

        if (!sessionData.session) {
          const next = pathname && pathname !== "/admin/login" ? pathname : "/admin";
          window.location.replace(`/admin/login?next=${encodeURIComponent(next)}`);
          return;
        }

        const { data: userData, error: userError } = await withTimeout(supabase.auth.getUser(), VERIFY_TIMEOUT_MS);
        if (cancelled) return;
        if (userError || !userData.user) {
          await supabase.auth.signOut();
          window.location.replace(`/admin/login?next=${encodeURIComponent(pathname || "/admin")}`);
          return;
        }

        const { data: admin, error: adminError } = await withTimeout(
          supabase.from("admin_users").select("user_id, role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle(),
          VERIFY_TIMEOUT_MS,
        );
        if (cancelled) return;

        if (adminError) {
          setError(adminError.message);
          setStatus("error");
          return;
        }
        if (!admin) {
          await supabase.auth.signOut();
          setStatus("denied");
          return;
        }

        setStatus("ready");
        const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
          if (cancelled) return;
          if (event === "SIGNED_OUT" || !nextSession) {
            window.location.replace(`/admin/login?next=${encodeURIComponent(pathname || "/admin")}`);
          }
        });
        subscription = authListener.subscription;
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unable to verify admin access.");
        setStatus("error");
      }
    }

    void verifyAdmin();
    return () => { cancelled = true; subscription?.unsubscribe(); };
  }, [pathname]);

  if (status === "ready") return <>{children}</>;

  if (status === "denied") return <AccessCard title="Admin access required" message="This account is authenticated but is not registered as a UMWAMBARO administrator." button="Back to admin login" onClick={() => window.location.replace("/admin/login")} />;

  if (status === "setup") return <AccessCard title="Supabase configuration required" message="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart Next.js." />;

  if (status === "error") return <AccessCard title="Unable to verify admin access" message={error || "Please try again. Your database remains protected by Supabase RLS."} button="Try again" onClick={() => window.location.reload()} error />;

  return <div className="flex min-h-screen items-center justify-center bg-[#f7efe4]"><div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#a44a2f] text-white"><Loader2 size={25} className="animate-spin" /></div><p className="mt-4 text-sm font-medium text-[#6f625d]">Checking admin access...</p><p className="mt-1 text-xs text-[#8b7d76]">Redirecting to secure sign in if needed.</p></div></div>;
}

function AccessCard({ title, message, button, onClick, error = false }: { title: string; message: string; button?: string; onClick?: () => void; error?: boolean }) {
  return <div className="flex min-h-screen items-center justify-center bg-[#f7efe4] px-4"><div className="w-full max-w-lg rounded-3xl border border-[#ead9c0] bg-[#fffaf3] p-8 text-center shadow-sm"><ShieldCheck className={`mx-auto ${error ? "text-red-500" : "text-[#a44a2f]"}`} size={42} /><h1 className="mt-5 text-2xl font-semibold text-[#2a211f]">{title}</h1><p className="mt-3 text-sm leading-6 text-[#6f625d]">{message}</p>{button && onClick && <button onClick={onClick} className="mt-6 rounded-xl bg-[#a44a2f] px-5 py-3 text-sm font-semibold text-white">{button}</button>}</div></div>;
}

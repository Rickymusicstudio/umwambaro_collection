"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Check your environment variables.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError || !data.user) {
        setError(signInError?.message ?? "Unable to sign in.");
        setLoading(false);
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id, role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminError) {
        await supabase.auth.signOut();
        setError(`Admin verification failed: ${adminError.message}`);
        setLoading(false);
        return;
      }

      if (!admin) {
        await supabase.auth.signOut();
        setError("This account is authenticated but is not registered as a UMWAMBARO administrator.");
        setLoading(false);
        return;
      }

      // Force a fresh navigation so the newly-created Supabase session is
      // available before the protected admin tree renders.
      window.location.assign("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--um-page)] px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-[var(--um-line)] bg-[#ffffff] p-8 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--um-dark2)] text-white"><ShieldCheck size={27} /></div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--um-dark2)]">UMWAMBARO ADMIN</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--um-dark)]">Admin sign in</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--um-muted)]">Sign in with the Supabase account registered as a UMWAMBARO administrator.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block"><span className="mb-2 block text-sm font-semibold">Email</span><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" className="h-12 w-full rounded-xl border border-[#bfae98] bg-white px-4 outline-none focus:border-[var(--um-cta)]" /></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Password</span><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="current-password" className="h-12 w-full rounded-xl border border-[#bfae98] bg-white px-4 outline-none focus:border-[var(--um-cta)]" /></label>
          {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <button disabled={loading} type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--um-dark2)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--um-dark)] disabled:opacity-60">
            {loading ? <><Loader2 size={17} className="animate-spin" /> Signing in...</> : <><LogIn size={17} /> Sign in</>}
          </button>
        </form>
      </div>
    </main>
  );
}

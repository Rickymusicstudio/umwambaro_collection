"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const VERIFY_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        reject(
          new Error(
            "Admin verification timed out. Please try again."
          )
        );
      }, ms);

      // Avoid keeping the timer alive after the promise resolves.
      promise.finally(() => clearTimeout(timer)).catch(() => {});
    }),
  ]);
}

export default function AdminGuard({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const [status, setStatus] = useState<
    "loading" | "ready" | "denied" | "setup" | "error"
  >("loading");

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    let subscription: { unsubscribe: () => void } | null = null;

    async function verifyAdmin() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        if (!cancelled) {
          setStatus("setup");
        }

        return;
      }

      try {
        /*
         * 1. Check whether a Supabase session exists.
         */
        const sessionResult = await withTimeout(
          supabase.auth.getSession(),
          VERIFY_TIMEOUT_MS
        );

        if (cancelled) return;

        const session = sessionResult.data.session;

        /*
         * No session → ALWAYS go to admin login.
         */
        if (!session) {
          const next =
            pathname && pathname !== "/admin/login"
              ? pathname
              : "/admin";

          window.location.replace(
            `/admin/login?next=${encodeURIComponent(next)}`
          );

          return;
        }

        /*
         * 2. Verify the authenticated user.
         */
        const userResult = await withTimeout(
          supabase.auth.getUser(),
          VERIFY_TIMEOUT_MS
        );

        if (cancelled) return;

        if (userResult.error || !userResult.data.user) {
          await supabase.auth.signOut();

          window.location.replace(
            `/admin/login?next=${encodeURIComponent(
              pathname || "/admin"
            )}`
          );

          return;
        }

        const userId = userResult.data.user.id;

        /*
         * 3. Check admin_users.
         *
         * IMPORTANT:
         * Promise.resolve() converts Supabase's PostgrestBuilder
         * into a real Promise so TypeScript correctly knows that
         * the result contains { data, error }.
         */
        const adminResult = await withTimeout(
          Promise.resolve(
            supabase
              .from("admin_users")
              .select("user_id, role")
              .eq("user_id", userId)
              .eq("role", "admin")
              .maybeSingle()
          ),
          VERIFY_TIMEOUT_MS
        );

        if (cancelled) return;

        if (adminResult.error) {
          setError(adminResult.error.message);
          setStatus("error");
          return;
        }

        /*
         * User authenticated but not an admin.
         */
        if (!adminResult.data) {
          await supabase.auth.signOut();

          if (!cancelled) {
            setStatus("denied");
          }

          return;
        }

        /*
         * Everything is valid.
         */
        if (!cancelled) {
          setStatus("ready");
        }

        /*
         * Keep watching the authentication state.
         */
        const { data: authListener } =
          supabase.auth.onAuthStateChange(
            (event, nextSession) => {
              if (cancelled) return;

              if (event === "SIGNED_OUT" || !nextSession) {
                window.location.replace(
                  `/admin/login?next=${encodeURIComponent(
                    pathname || "/admin"
                  )}`
                );
              }
            }
          );

        subscription = authListener.subscription;
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to verify admin access."
        );

        setStatus("error");
      }
    }

    void verifyAdmin();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [pathname]);

  /*
   * ADMIN VERIFIED
   */
  if (status === "ready") {
    return <>{children}</>;
  }

  /*
   * AUTHENTICATED BUT NOT ADMIN
   */
  if (status === "denied") {
    return (
      <AccessCard
        title="Admin access required"
        message="This account is authenticated but is not registered as a UMWAMBARO administrator."
        button="Back to admin login"
        onClick={() =>
          window.location.replace("/admin/login")
        }
        error
      />
    );
  }

  /*
   * SUPABASE NOT CONFIGURED
   */
  if (status === "setup") {
    return (
      <AccessCard
        title="Supabase configuration required"
        message="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart Next.js."
      />
    );
  }

  /*
   * VERIFICATION ERROR
   */
  if (status === "error") {
    return (
      <AccessCard
        title="Unable to verify admin access"
        message={
          error ||
          "Please try again. Your database remains protected by Supabase RLS."
        }
        button="Try again"
        onClick={() => window.location.reload()}
        error
      />
    );
  }

  /*
   * LOADING
   */
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3e9dc]">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#4a2c1d] text-white">
          <Loader2
            size={25}
            className="animate-spin"
          />
        </div>

        <p className="mt-4 text-sm font-medium text-[#6b5a4e]">
          Checking admin access...
        </p>

        <p className="mt-1 text-xs text-[#6f7373]">
          Redirecting to secure sign in if needed.
        </p>
      </div>
    </div>
  );
}

function AccessCard({
  title,
  message,
  button,
  onClick,
  error = false,
}: {
  title: string;
  message: string;
  button?: string;
  onClick?: () => void;
  error?: boolean;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3e9dc] px-4">
      <div className="w-full max-w-lg rounded-lg border border-[#e3d5c3] bg-[#ffffff] p-8 text-center shadow-sm">
        <ShieldCheck
          className={`mx-auto ${
            error ? "text-red-500" : "text-[#4a2c1d]"
          }`}
          size={42}
        />

        <h1 className="mt-5 text-2xl font-semibold text-[#2b1810]">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#6b5a4e]">
          {message}
        </p>

        {button && onClick && (
          <button
            type="button"
            onClick={onClick}
            className="mt-6 rounded-xl bg-[#4a2c1d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2b1810]"
          >
            {button}
          </button>
        )}
      </div>
    </div>
  );
}
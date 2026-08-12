# UMWAMBARO Admin Authentication Fix

The admin area now behaves as follows:

1. Visiting `/admin` without a Supabase session redirects to `/admin/login`.
2. The login page authenticates with Supabase Auth.
3. The authenticated user must exist in `public.admin_users` with `role = 'admin'`.
4. After successful login the browser performs a fresh navigation to `/admin`, avoiding stale client state.
5. If a session expires or the user signs out, the protected admin area redirects to the login page.
6. Supabase RLS remains the database-level security boundary.

If an old development session is causing unexpected behavior, sign out from Supabase in the app or clear the site's local storage once, then sign in again.

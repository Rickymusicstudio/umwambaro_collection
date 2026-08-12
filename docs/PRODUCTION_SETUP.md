# UMWAMBARO Collections - Production Setup

## 1. Supabase

Run `database/UMWAMBARO_FINAL_RESTORE.sql` in the Supabase SQL Editor. It is designed for the current flat order schema and is idempotent for the main tables, policies, indexes and checkout RPC.

Create the admin user in Supabase Authentication, then insert that user's UUID into `public.admin_users`.

The checkout uses `public.place_order(...)`. The function reads current product prices and stock under row locks, creates the order and order items atomically, and decrements stock. The browser never submits trusted product prices or totals.

## 2. Environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER`

No WhatsApp Cloud API token is required for the current order notification flow.

## 3. WhatsApp order handoff

After an order is successfully committed, checkout opens WhatsApp/WhatsApp Web with a pre-filled order message addressed to the configured admin number. The message contains the order number, customer, delivery information, items, totals and payment method.

The browser cannot silently press WhatsApp's Send button. The admin must press **Send**. This is intentional browser/WhatsApp security behavior and requires no Meta API token.

The app opens a blank tab immediately from the Place Order click so popup blockers are less likely to prevent the later WhatsApp redirect after the order API completes.

## 4. Production checks

- Use HTTPS in production.
- Configure Supabase Auth site URL and redirect URLs for the production domain.
- Keep `admin_users` limited to real administrators.
- Confirm RLS is enabled on `products`, `orders` and `order_items`.
- Confirm the `product-images` bucket is public for storefront reads and write/delete policies are admin-only.
- Test a product with stock = 1 and confirm a second checkout is rejected.
- Test a checkout twice with the same client order ID and confirm it does not create a duplicate.
- Test direct `/admin` access while logged out: it must redirect to `/admin/login`.
- Test admin login, refresh, logout and re-login.
- Test Place Order on both desktop and mobile WhatsApp.

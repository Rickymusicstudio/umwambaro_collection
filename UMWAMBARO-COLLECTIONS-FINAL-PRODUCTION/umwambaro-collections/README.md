# UMWAMBARO Collections

Production-oriented single-seller ecommerce storefront for Rwanda, built with Next.js, TypeScript and Supabase.

## Included

- Responsive UMWAMBARO storefront with warmer Rwanda-inspired colors
- Supabase product catalog and Storage image uploads
- New + Chaguwa/used product condition
- Product gallery, filters, search and cart
- Server-side checkout API
- Atomic stock validation/decrement in PostgreSQL
- Flat Supabase-backed orders, order items and customer views
- Supabase Auth + `admin_users` authorization
- RLS-protected admin product and order operations
- Admin dashboard with live order/product statistics
- Cash on Delivery checkout
- Tokenless WhatsApp order handoff using `wa.me`
- Popup-safe WhatsApp opening with a structured order message

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add the Supabase URL/key.
4. Set `NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER` to the store admin's Rwanda number in international format, for example `2507XXXXXXXX`.
5. Run `database/UMWAMBARO_FINAL_RESTORE.sql` in the Supabase SQL Editor.
6. Create the admin user in Supabase Authentication and add that user's UUID to `public.admin_users`.
7. Start with `npm run dev`.
8. For production, run `npm run build` then `npm start`.

## WhatsApp order flow

When the customer presses **Place Order**:

1. A blank WhatsApp tab is opened immediately to avoid popup blockers.
2. The order is created atomically in Supabase.
3. The tab is redirected to WhatsApp with a pre-filled structured order message.
4. The customer/admin presses **Send** in WhatsApp.
5. The storefront redirects to the order-success page.

The current flow does **not** use the WhatsApp Cloud API and therefore does not require a Meta access token, phone-number ID or approved template.

Browsers and WhatsApp do not allow a website to silently press the final Send button. The user must confirm/send the message in WhatsApp.

## Database

Use `database/UMWAMBARO_FINAL_RESTORE.sql` for the current database. Older scripts are kept under `database/legacy/` for reference only.

The final script includes product condition support, admin authorization, product/image RLS, the current flat order schema, order indexes and the atomic `place_order()` RPC.

See `docs/PRODUCTION_SETUP.md` for the production checklist.

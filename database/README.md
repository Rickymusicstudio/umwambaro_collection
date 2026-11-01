# UMWAMBARO database

## Use this for the current production project

Run:

`UMWAMBARO_FINAL_RESTORE.sql`

This is the single current restore/migration script. It contains:

- products and product-condition support (`new` / `chaguwa`)
- product indexes and RLS
- admin_users and admin authorization function
- current flat orders schema
- order_items
- order indexes
- secure atomic `place_order()` RPC
- order RLS
- product image storage bucket and policies

It does **not** seed demo products.

### Create the admin

Create the admin account under Supabase Authentication first, then run:

```sql
insert into public.admin_users (user_id)
values ('YOUR_AUTH_USER_UUID')
on conflict (user_id) do nothing;
```

The `legacy/` directory contains older restore scripts kept only for reference. Do not use those scripts for a new production installation.

## Accounting (admin → Accounting)

Run `ACCOUNTING_SETUP.sql` once, after the main script. It adds:

- `money_entries`: in-shop sales, other income and expenses
- `debts` + `debt_payments`: amadeni (customers who owe the shop, and what the shop owes)
- admin-only RLS on all three tables

Website orders are counted automatically once they are marked **Delivered**.

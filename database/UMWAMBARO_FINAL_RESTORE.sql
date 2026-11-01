-- UMWAMBARO COLLECTIONS - FINAL PRODUCTION DATABASE
-- Supabase / PostgreSQL
--
-- Safe to run on a fresh database and designed to be repeatable on the
-- current UMWAMBARO database. It does NOT seed demo products.
--
-- Main order schema is intentionally flat:
-- customer_name, customer_phone, delivery_address, district, sector, etc.
-- This matches the production admin pages.

create extension if not exists pgcrypto;

-- ============================================================
-- PRODUCTS
-- ============================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text unique,
  slug text unique not null,
  name text not null,
  description text,
  category text not null,
  condition text not null default 'new' check (condition in ('new', 'chaguwa')),
  brand text,
  price integer not null check (price >= 0),
  compare_price integer check (compare_price is null or compare_price >= price),
  currency text not null default 'RWF',
  stock integer not null default 0 check (stock >= 0),
  image text,
  hover_image text,
  images text[] not null default '{}',
  rating numeric(2,1),
  reviews integer not null default 0,
  colors text[] not null default '{}',
  sizes text[] not null default '{}',
  featured boolean not null default false,
  trending boolean not null default false,
  is_new boolean not null default false,
  best_seller boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category);
create index if not exists products_created_at_idx on public.products(created_at desc);
create index if not exists products_active_idx on public.products(is_active);
create index if not exists products_featured_idx on public.products(featured) where featured = true;
create index if not exists products_trending_idx on public.products(trending) where trending = true;
create index if not exists products_best_seller_idx on public.products(best_seller) where best_seller = true;

alter table public.products enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select to anon, authenticated
using (is_active = true);

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
before update on public.products
for each row execute function public.set_products_updated_at();

-- ============================================================
-- ADMIN AUTHORIZATION
-- ============================================================

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "Admins can read their own admin record" on public.admin_users;
create policy "Admins can read their own admin record"
on public.admin_users for select to authenticated
using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products for insert to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products for delete to authenticated
using (public.is_admin());

drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
on public.products for select to authenticated
using (public.is_admin());

-- ============================================================
-- ORDERS - CURRENT FLAT PRODUCTION SCHEMA
-- ============================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  client_order_id uuid unique not null,
  order_number text unique not null,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  delivery_address text not null,
  district text not null,
  sector text,
  cell text,
  delivery_notes text,
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  total_amount integer not null check (total_amount >= 0),
  currency text not null default 'RWF',
  payment_method text not null default 'cash_on_delivery' check (payment_method = 'cash_on_delivery'),
  payment_status text not null default 'pending',
  status text not null default 'pending' check (status in ('pending','confirmed','delivered','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Upgrade older UMWAMBARO order tables without deleting existing orders.
alter table public.orders add column if not exists user_id uuid;
alter table public.orders add column if not exists client_order_id uuid;
alter table public.orders add column if not exists order_number text;
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists customer_phone text;
alter table public.orders add column if not exists delivery_address text;
alter table public.orders add column if not exists district text;
alter table public.orders add column if not exists sector text;
alter table public.orders add column if not exists cell text;
alter table public.orders add column if not exists delivery_notes text;
alter table public.orders add column if not exists subtotal integer;
alter table public.orders add column if not exists delivery_fee integer;
alter table public.orders add column if not exists total_amount integer;
alter table public.orders add column if not exists currency text;
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists payment_status text;
alter table public.orders add column if not exists status text;
alter table public.orders add column if not exists created_at timestamptz;
alter table public.orders add column if not exists updated_at timestamptz;

-- If the previous version stored customer details in JSONB, migrate those
-- values into the flat columns. This block only runs when the old customer
-- column exists.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'customer'
  ) then
    execute $m$
      update public.orders
      set customer_name = coalesce(customer_name, nullif(customer->>'fullName', '')),
          customer_email = coalesce(customer_email, nullif(customer->>'email', '')),
          customer_phone = coalesce(customer_phone, nullif(customer->>'phone', '')),
          delivery_address = coalesce(delivery_address, nullif(customer->>'address', '')),
          district = coalesce(district, nullif(customer->>'district', '')),
          sector = coalesce(sector, nullif(customer->>'sector', '')),
          delivery_notes = coalesce(delivery_notes, nullif(customer->>'notes', ''))
      where customer is not null
    $m$;
  end if;
end;
$$;

-- Migrate old amount column names if they existed.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='shipping') then
    execute 'update public.orders set delivery_fee = coalesce(delivery_fee, shipping) where delivery_fee is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='total') then
    execute 'update public.orders set total_amount = coalesce(total_amount, total) where total_amount is null';
  end if;
end;
$$;

-- Older schemas may have customer as NOT NULL. The flat schema no longer uses it.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='orders' and column_name='customer'
  ) then
    execute 'alter table public.orders alter column customer drop not null';
  end if;
end;
$$;

update public.orders
set client_order_id = coalesce(client_order_id, gen_random_uuid()),
    order_number = coalesce(order_number, 'UMW-' || to_char(coalesce(created_at, now()), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))),
    delivery_fee = coalesce(delivery_fee, 0),
    total_amount = coalesce(total_amount, coalesce(subtotal, 0) + coalesce(delivery_fee, 0)),
    currency = coalesce(currency, 'RWF'),
    payment_method = coalesce(payment_method, 'cash_on_delivery'),
    payment_status = coalesce(payment_status, 'pending'),
    status = coalesce(status, 'pending'),
    created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now())
where client_order_id is null
   or order_number is null
   or delivery_fee is null
   or total_amount is null
   or currency is null
   or payment_method is null
   or payment_status is null
   or status is null
   or created_at is null
   or updated_at is null;

-- These constraints are only added after old data has been backfilled.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'orders_client_order_id_key') then
    alter table public.orders add constraint orders_client_order_id_key unique (client_order_id);
  end if;
end;
$$;

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_customer_phone_idx on public.orders(customer_phone);
create index if not exists orders_district_idx on public.orders(district);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  sku text,
  price integer not null check (price >= 0),
  quantity integer not null check (quantity > 0),
  color text,
  size text,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
on public.orders for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
on public.orders for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can read order items" on public.order_items;
create policy "Admins can read order items"
on public.order_items for select to authenticated
using (public.is_admin());

create or replace function public.set_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
before update on public.orders
for each row execute function public.set_orders_updated_at();

-- ============================================================
-- ATOMIC PUBLIC CHECKOUT RPC
-- ============================================================

create or replace function public.place_order(
  p_client_order_id uuid,
  p_customer jsonb,
  p_items jsonb,
  p_shipping integer default 0,
  p_payment_method text default 'cash_on_delivery'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_subtotal integer := 0;
  v_shipping integer := greatest(coalesce(p_shipping, 0), 0);
  v_item jsonb;
  v_product public.products%rowtype;
  v_product_id uuid;
  v_quantity integer;
  v_color text;
  v_size text;
  v_total integer;
  v_existing public.orders%rowtype;
begin
  if p_payment_method <> 'cash_on_delivery' then
    raise exception 'Unsupported payment method';
  end if;

  if p_customer is null
     or coalesce(trim(p_customer->>'fullName'), '') = ''
     or coalesce(trim(p_customer->>'phone'), '') = ''
     or coalesce(trim(p_customer->>'district'), '') = ''
     or coalesce(trim(p_customer->>'address'), '') = '' then
    raise exception 'Complete customer delivery information is required';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  select * into v_existing
  from public.orders
  where client_order_id = p_client_order_id;

  if found then
    return jsonb_build_object(
      'id', v_existing.id,
      'order_number', v_existing.order_number,
      'subtotal', coalesce(v_existing.subtotal, 0),
      'shipping', coalesce(v_existing.delivery_fee, 0),
      'total', coalesce(v_existing.total_amount, 0),
      'existing', true
    );
  end if;

  -- Validate every product under a row lock before creating anything.
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := nullif(v_item->>'productId', '')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    v_color := nullif(trim(v_item->>'color'), '');
    v_size := nullif(trim(v_item->>'size'), '');

    if v_quantity is null or v_quantity < 1 then
      raise exception 'Invalid product quantity';
    end if;

    select * into v_product
    from public.products
    where id = v_product_id
      and is_active = true
    for update;

    if not found then
      raise exception 'One of the selected products is no longer available';
    end if;

    if v_product.stock < v_quantity then
      raise exception 'Not enough stock for %', v_product.name;
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  end loop;

  v_total := v_subtotal + v_shipping;
  v_order_id := gen_random_uuid();
  v_order_number := 'UMW-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (
    id, user_id, client_order_id, order_number, customer_name, customer_email,
    customer_phone, delivery_address, district, sector, cell, delivery_notes,
    subtotal, delivery_fee, total_amount, currency, payment_method,
    payment_status, status
  ) values (
    v_order_id,
    auth.uid(),
    p_client_order_id,
    v_order_number,
    trim(p_customer->>'fullName'),
    nullif(trim(p_customer->>'email'), ''),
    trim(p_customer->>'phone'),
    trim(p_customer->>'address'),
    trim(p_customer->>'district'),
    nullif(trim(p_customer->>'sector'), ''),
    nullif(trim(p_customer->>'cell'), ''),
    nullif(trim(p_customer->>'notes'), ''),
    v_subtotal,
    v_shipping,
    v_total,
    'RWF',
    p_payment_method,
    'pending',
    'pending'
  );

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'productId')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    v_color := nullif(trim(v_item->>'color'), '');
    v_size := nullif(trim(v_item->>'size'), '');

    select * into v_product
    from public.products
    where id = v_product_id
    for update;

    insert into public.order_items (
      order_id, product_id, product_name, sku, price, quantity, color, size
    ) values (
      v_order_id, v_product.id, v_product.name, v_product.sku,
      v_product.price, v_quantity, v_color, v_size
    );

    update public.products
    set stock = stock - v_quantity,
        is_active = case when stock - v_quantity <= 0 then false else is_active end,
        updated_at = now()
    where id = v_product.id;
  end loop;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping', v_shipping,
    'total', v_total,
    'existing', false
  );
end;
$$;

revoke all on function public.place_order(uuid, jsonb, jsonb, integer, text) from public;
grant execute on function public.place_order(uuid, jsonb, jsonb, integer, text) to anon, authenticated;

-- ============================================================
-- STORAGE
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select to public
using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects for update to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and public.is_admin());

-- ============================================================
-- ADMIN USER SETUP
-- ============================================================
-- After creating the administrator in Supabase Authentication, run:
-- insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_UUID')
-- on conflict (user_id) do nothing;

-- ############################################################
-- VERSION 2 (launch) — delivery fees, stock on cancel,
-- customer accounts, order history, wishlist, order tracking.
-- Safe to re-run. Keeps all existing data.
-- ############################################################

-- ============================================================
-- DELIVERY ZONES (one row per district, fee set by the admin)
-- ============================================================

create table if not exists public.delivery_zones (
  district text primary key,
  province text not null,
  fee integer not null default 0 check (fee >= 0),
  active boolean not null default true,
  sort integer not null default 100
);

-- Starting fees: Kigali 2,000 RWF, rest of Rwanda 5,000 RWF.
-- The admin can change every fee in Admin -> Settings.
insert into public.delivery_zones (district, province, fee, sort) values
  ('Gasabo','Kigali',2000,1),('Kicukiro','Kigali',2000,2),('Nyarugenge','Kigali',2000,3),
  ('Bugesera','East',5000,10),('Gatsibo','East',5000,11),('Kayonza','East',5000,12),('Kirehe','East',5000,13),
  ('Ngoma','East',5000,14),('Nyagatare','East',5000,15),('Rwamagana','East',5000,16),
  ('Burera','North',5000,20),('Gakenke','North',5000,21),('Gicumbi','North',5000,22),('Musanze','North',5000,23),('Rulindo','North',5000,24),
  ('Gisagara','South',5000,30),('Huye','South',5000,31),('Kamonyi','South',5000,32),('Muhanga','South',5000,33),
  ('Nyamagabe','South',5000,34),('Nyanza','South',5000,35),('Nyaruguru','South',5000,36),('Ruhango','South',5000,37),
  ('Karongi','West',5000,40),('Ngororero','West',5000,41),('Nyabihu','West',5000,42),('Nyamasheke','West',5000,43),
  ('Rubavu','West',5000,44),('Rusizi','West',5000,45),('Rutsiro','West',5000,46)
on conflict (district) do nothing;

alter table public.delivery_zones enable row level security;
drop policy if exists "Anyone can read delivery zones" on public.delivery_zones;
create policy "Anyone can read delivery zones" on public.delivery_zones
  for select to anon, authenticated using (true);
drop policy if exists "Admins manage delivery zones" on public.delivery_zones;
create policy "Admins manage delivery zones" on public.delivery_zones
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- CHECKOUT: delivery fee now comes from delivery_zones (server side),
-- never from the browser. Signature unchanged for the API route.
-- ============================================================

create or replace function public.place_order(
  p_client_order_id uuid,
  p_customer jsonb,
  p_items jsonb,
  p_shipping integer default 0,          -- ignored: kept for compatibility
  p_payment_method text default 'cash_on_delivery'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_subtotal integer := 0;
  v_shipping integer;
  v_district text := trim(coalesce(p_customer->>'district', ''));
  v_item jsonb;
  v_product public.products%rowtype;
  v_product_id uuid;
  v_quantity integer;
  v_total integer;
  v_existing public.orders%rowtype;
begin
  if p_payment_method <> 'cash_on_delivery' then
    raise exception 'Unsupported payment method';
  end if;

  if p_customer is null
     or coalesce(trim(p_customer->>'fullName'), '') = ''
     or coalesce(trim(p_customer->>'phone'), '') = ''
     or v_district = ''
     or coalesce(trim(p_customer->>'address'), '') = '' then
    raise exception 'Complete customer delivery information is required';
  end if;

  select fee into v_shipping from public.delivery_zones
   where lower(district) = lower(v_district) and active = true;
  if not found then
    raise exception 'We do not deliver to this district yet';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  select * into v_existing from public.orders where client_order_id = p_client_order_id;
  if found then
    return jsonb_build_object(
      'id', v_existing.id, 'order_number', v_existing.order_number,
      'subtotal', coalesce(v_existing.subtotal, 0), 'shipping', coalesce(v_existing.delivery_fee, 0),
      'total', coalesce(v_existing.total_amount, 0), 'existing', true);
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := nullif(v_item->>'productId', '')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity is null or v_quantity < 1 then
      raise exception 'Invalid product quantity';
    end if;
    select * into v_product from public.products
     where id = v_product_id and is_active = true for update;
    if not found then
      raise exception 'One of the selected products is no longer available';
    end if;
    if v_product.stock < v_quantity then
      raise exception 'Not enough stock for %', v_product.name;
    end if;
    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  end loop;

  v_total := v_subtotal + v_shipping;
  v_order_id := gen_random_uuid();
  v_order_number := 'UMW-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (
    id, user_id, client_order_id, order_number, customer_name, customer_email,
    customer_phone, delivery_address, district, sector, cell, delivery_notes,
    subtotal, delivery_fee, total_amount, currency, payment_method, payment_status, status
  ) values (
    v_order_id, auth.uid(), p_client_order_id, v_order_number,
    trim(p_customer->>'fullName'), nullif(trim(p_customer->>'email'), ''),
    trim(p_customer->>'phone'), trim(p_customer->>'address'),
    (select district from public.delivery_zones where lower(district) = lower(v_district)),
    nullif(trim(p_customer->>'sector'), ''), nullif(trim(p_customer->>'cell'), ''),
    nullif(trim(p_customer->>'notes'), ''),
    v_subtotal, v_shipping, v_total, 'RWF', p_payment_method, 'pending', 'pending'
  );

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'productId')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    select * into v_product from public.products where id = v_product_id for update;
    insert into public.order_items (order_id, product_id, product_name, sku, price, quantity, color, size)
    values (v_order_id, v_product.id, v_product.name, v_product.sku, v_product.price, v_quantity,
            nullif(trim(v_item->>'color'), ''), nullif(trim(v_item->>'size'), ''));
    update public.products
       set stock = stock - v_quantity,
           is_active = case when stock - v_quantity <= 0 then false else is_active end,
           updated_at = now()
     where id = v_product.id;
  end loop;

  return jsonb_build_object('id', v_order_id, 'order_number', v_order_number,
    'subtotal', v_subtotal, 'shipping', v_shipping, 'total', v_total, 'existing', false);
end;
$$;

revoke all on function public.place_order(uuid, jsonb, jsonb, integer, text) from public;
grant execute on function public.place_order(uuid, jsonb, jsonb, integer, text) to anon, authenticated;

-- ============================================================
-- STOCK GOES BACK WHEN AN ORDER IS CANCELLED
-- (and is taken again if a cancelled order is re-opened)
-- ============================================================

create or replace function public.restock_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item record;
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    for v_item in select product_id, quantity from public.order_items where order_id = new.id loop
      update public.products
         set stock = stock + v_item.quantity,
             is_active = case when stock = 0 then true else is_active end,
             updated_at = now()
       where id = v_item.product_id;
    end loop;
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    for v_item in select oi.product_id, oi.quantity, p.stock, p.name
                    from public.order_items oi join public.products p on p.id = oi.product_id
                   where oi.order_id = new.id for update of p loop
      if v_item.stock < v_item.quantity then
        raise exception 'Not enough stock to re-open this order (%)', v_item.name;
      end if;
      update public.products
         set stock = stock - v_item.quantity,
             is_active = case when stock - v_item.quantity <= 0 then false else is_active end,
             updated_at = now()
       where id = v_item.product_id;
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_restock_on_cancel on public.orders;
create trigger orders_restock_on_cancel
after update of status on public.orders
for each row execute function public.restock_on_cancel();

-- ============================================================
-- CUSTOMER ACCOUNTS (login with phone number + password)
-- ============================================================

create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null unique,
  email text,
  district text,
  sector text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;
drop policy if exists "Customers read own profile" on public.customer_profiles;
create policy "Customers read own profile" on public.customer_profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "Customers update own profile" on public.customer_profiles;
create policy "Customers update own profile" on public.customer_profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- phone can't be changed by the customer (it is their login)
create or replace function public.guard_customer_profile()
returns trigger language plpgsql as $$
begin
  if new.phone is distinct from old.phone and auth.uid() is not null and not public.is_admin() then
    raise exception 'Phone number cannot be changed';
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists customer_profiles_guard on public.customer_profiles;
create trigger customer_profiles_guard before update on public.customer_profiles
for each row execute function public.guard_customer_profile();

-- create the profile when a customer signs up (admins are created by hand and are skipped)
create or replace function public.handle_new_customer()
returns trigger language plpgsql security definer set search_path = public as $$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  if m->>'account_type' = 'customer' then
    insert into public.customer_profiles (id, full_name, phone, email)
    values (new.id, coalesce(nullif(trim(m->>'full_name'), ''), 'Customer'),
            coalesce(m->>'phone', ''), nullif(trim(m->>'email'), ''))
    on conflict (id) do nothing;
  end if;
  return new;
end $$;
drop trigger if exists on_auth_user_created_customer on auth.users;
create trigger on_auth_user_created_customer
after insert on auth.users
for each row execute function public.handle_new_customer();

-- customers can read their own orders and order items
drop policy if exists "Customers read own orders" on public.orders;
create policy "Customers read own orders" on public.orders
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "Customers read own order items" on public.order_items;
create policy "Customers read own order items" on public.order_items
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- a customer may cancel their own order while it is still pending
create or replace function public.cancel_my_order(p_order_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update public.orders set status = 'cancelled'
   where id = p_order_id and user_id = auth.uid() and status = 'pending';
  if not found then
    raise exception 'This order can no longer be cancelled';
  end if;
  return true;
end $$;
revoke all on function public.cancel_my_order(uuid) from public;
grant execute on function public.cancel_my_order(uuid) to authenticated;

-- ============================================================
-- WISHLIST
-- ============================================================

create table if not exists public.wishlist_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
alter table public.wishlist_items enable row level security;
drop policy if exists "Customers manage own wishlist" on public.wishlist_items;
create policy "Customers manage own wishlist" on public.wishlist_items
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- TRACK AN ORDER (no account needed): order number + phone
-- ============================================================

create or replace function public.track_order(p_order_number text, p_phone text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_order public.orders%rowtype;
begin
  if length(v_digits) = 10 and left(v_digits, 1) = '0' then v_digits := '250' || substr(v_digits, 2); end if;
  select * into v_order from public.orders
   where upper(order_number) = upper(trim(p_order_number))
     and regexp_replace(customer_phone, '\D', '', 'g') = v_digits;
  if not found then return null; end if;
  return jsonb_build_object(
    'order_number', v_order.order_number, 'status', v_order.status,
    'created_at', v_order.created_at, 'updated_at', v_order.updated_at,
    'district', v_order.district, 'subtotal', v_order.subtotal,
    'delivery_fee', v_order.delivery_fee, 'total', v_order.total_amount,
    'items', coalesce((select jsonb_agg(jsonb_build_object('name', product_name, 'quantity', quantity,
                         'price', price, 'size', size, 'color', color) order by created_at)
                       from public.order_items where order_id = v_order.id), '[]'::jsonb));
end $$;
revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;

create index if not exists orders_user_id_idx on public.orders(user_id);

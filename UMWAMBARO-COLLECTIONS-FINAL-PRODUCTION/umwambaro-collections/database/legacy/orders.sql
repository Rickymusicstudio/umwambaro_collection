-- UMWAMBARO COLLECTIONS - Production orders
-- Run after UMWAMBARO_FULL_RESTORE.sql.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  client_order_id uuid unique not null,
  order_number text unique not null,
  status text not null default 'pending' check (status in ('pending','confirmed','delivered','cancelled')),
  payment_method text not null default 'cash_on_delivery' check (payment_method = 'cash_on_delivery'),
  customer jsonb not null,
  subtotal integer not null check (subtotal >= 0),
  shipping integer not null default 0 check (shipping >= 0),
  total integer not null check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on restrict,
  product_name text not null,
  sku text,
  price integer not null check (price >= 0),
  quantity integer not null check (quantity > 0),
  color text,
  size text,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_customer_phone_idx on public.orders((customer->>'phone'));
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

-- Public checkout RPC. The browser never supplies product prices or totals as trusted values.
-- The function reads the current product price/stock under row locks and creates the order atomically.
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
      'total', v_existing.total,
      'existing', true
    );
  end if;

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
  v_order_number := 'UMW-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (
    id, client_order_id, order_number, status, payment_method,
    customer, subtotal, shipping, total
  ) values (
    v_order_id, p_client_order_id, v_order_number, 'pending',
    p_payment_method, p_customer, v_subtotal, v_shipping, v_total
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

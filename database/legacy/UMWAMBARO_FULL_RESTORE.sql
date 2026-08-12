-- UMWAMBARO COLLECTIONS
-- Product catalog for Supabase
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

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
on public.products
for select
to anon, authenticated
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

-- For an existing database, run database/add-product-condition.sql first.

-- Optional seed data. Delete these rows if you want to start with an empty catalog.
insert into public.products
  (sku, slug, name, description, category, condition, brand, price, compare_price, currency, stock,
   image, hover_image, images, rating, reviews, colors, sizes, featured, trending, is_new, best_seller)
values
  ('UMW-001', 'elegant-kaftan', 'Elegant Kaftan',
   'Modern handcrafted kaftan inspired by African elegance.', 'Women', 'new', 'Umwambaro',
   95000, 120000, 'RWF', 14,
   '/images/products/product1.png', '/images/products/product2.png',
   array['/images/products/product1.png','/images/products/product2.png'],
   4.8, 22, array['Black','Cream'], array['S','M','L','XL'], true, true, true, false),
  ('UMW-002', 'luxury-blazer', 'Luxury Blazer',
   'Premium blazer for modern professionals.', 'Men', 'new', 'Umwambaro',
   120000, null, 'RWF', 8,
   '/images/products/product2.png', '/images/products/product3.png',
   array['/images/products/product2.png','/images/products/product3.png'],
   5.0, 11, array['Black'], array['M','L','XL'], true, true, true, true),
  ('UMW-003', 'everyday-shirt', 'Everyday Shirt',
   'A versatile everyday shirt designed for comfort and easy styling.', 'Men', 'new', 'Umwambaro',
   65000, 75000, 'RWF', 12,
   '/images/products/product3.png', '/images/products/product4.png',
   array['/images/products/product3.png','/images/products/product4.png'],
   4.7, 18, array['White','Blue'], array['S','M','L','XL'], false, true, false, true),
  ('UMW-004', 'classic-casual-look', 'Classic Casual Look',
   'A relaxed wardrobe essential that works from day to evening.', 'Women', 'new', 'Umwambaro',
   78000, 95000, 'RWF', 6,
   '/images/products/product4.png', '/images/products/product1.png',
   array['/images/products/product4.png','/images/products/product1.png'],
   4.6, 9, array['Cream','Black'], array['S','M','L'], false, false, true, true)
on conflict (sku) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  brand = excluded.brand,
  condition = excluded.condition,
  price = excluded.price,
  compare_price = excluded.compare_price,
  stock = excluded.stock,
  image = excluded.image,
  hover_image = excluded.hover_image,
  images = excluded.images,
  rating = excluded.rating,
  reviews = excluded.reviews,
  colors = excluded.colors,
  sizes = excluded.sizes,
  featured = excluded.featured,
  trending = excluded.trending,
  is_new = excluded.is_new,
  best_seller = excluded.best_seller,
  is_active = true,
  updated_at = now();
-- UMWAMBARO COLLECTIONS
-- Admin authentication + product write permissions.
-- Run after supabase-products.sql.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "Admins can read their own admin record" on public.admin_users;
create policy "Admins can read their own admin record"
on public.admin_users
for select
to authenticated
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

-- Product writes are only allowed for authenticated admin users.
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products
for delete
to authenticated
using (public.is_admin());

-- After creating your admin user in Supabase Authentication,
-- replace YOUR_AUTH_USER_UUID below and run this statement once:
-- insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_UUID') on conflict do nothing;


drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
on public.products
for select
to authenticated
using (public.is_admin());
-- UMWAMBARO COLLECTIONS
-- Supabase Storage for product images.
-- Run AFTER supabase-admin.sql because the policies use public.is_admin().

-- Create a public bucket so storefront customers can display product images.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update
set public = true;

-- Public storefronts may read product images.
drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

-- Only authenticated UMWAMBARO admins can upload product images.
drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and public.is_admin()
);

-- Only authenticated UMWAMBARO admins can update product images.
drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_admin()
)
with check (
  bucket_id = 'product-images'
  and public.is_admin()
);

-- Only authenticated UMWAMBARO admins can delete product images.
drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_admin()
);

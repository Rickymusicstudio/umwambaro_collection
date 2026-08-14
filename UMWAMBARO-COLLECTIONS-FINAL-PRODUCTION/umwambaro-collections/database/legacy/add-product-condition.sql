-- UMWAMBARO COLLECTIONS
-- Run once on an existing Supabase project.
-- Adds the product condition used by the catalog: New or Chaguwa (Used).

alter table public.products
  add column if not exists condition text not null default 'new';

alter table public.products
  drop constraint if exists products_condition_check;

alter table public.products
  add constraint products_condition_check
  check (condition in ('new', 'chaguwa'));

create index if not exists products_condition_idx
  on public.products(condition);

-- Existing products are treated as New unless you edit them in Admin.
update public.products
set condition = 'new'
where condition is null or condition not in ('new', 'chaguwa');

notify pgrst, 'reload schema';

-- ############################################################
-- UMWAMBARO ACCOUNTING (admin only)
-- In-shop sales, other income, expenses and amadeni (debts).
-- Run once in the Supabase SQL Editor after UMWAMBARO_FINAL_RESTORE.sql.
-- Safe to re-run. Keeps all existing data.
-- ############################################################

-- ============================================================
-- MONEY ENTRIES: anything that is not a website order
--   sale    = sold in the shop / by phone, paid right away
--   income  = other money in (e.g. owner adds capital)
--   expense = money out (stock, rent, transport, salaries…)
-- ============================================================

create table if not exists public.money_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null default current_date,
  kind text not null check (kind in ('sale','income','expense')),
  category text not null default 'Other',
  description text,
  amount integer not null check (amount > 0),
  payment_method text not null default 'cash' check (payment_method in ('cash','momo','bank','other')),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists money_entries_date_idx on public.money_entries (entry_date desc);
create index if not exists money_entries_kind_idx on public.money_entries (kind);

-- ============================================================
-- AMADENI (debts)
--   owed_to_us = a customer took goods and will pay later
--   we_owe     = we took stock / a service and will pay later
-- ============================================================

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  direction text not null check (direction in ('owed_to_us','we_owe')),
  person_name text not null,
  phone text,
  description text,
  amount integer not null check (amount > 0),
  debt_date date not null default current_date,
  due_date date,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists debts_direction_idx on public.debts (direction);

create table if not exists public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid not null references public.debts(id) on delete cascade,
  amount integer not null check (amount > 0),
  paid_on date not null default current_date,
  payment_method text not null default 'cash' check (payment_method in ('cash','momo','bank','other')),
  note text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists debt_payments_debt_idx on public.debt_payments (debt_id);
create index if not exists debt_payments_date_idx on public.debt_payments (paid_on desc);

-- A debt can't be paid more than its amount.
create or replace function public.check_debt_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount integer;
  v_paid integer;
begin
  select amount into v_amount from public.debts where id = new.debt_id for update;
  select coalesce(sum(amount), 0) into v_paid
    from public.debt_payments
   where debt_id = new.debt_id and id <> new.id;
  if v_paid + new.amount > v_amount then
    raise exception 'Payment is more than what is left (% RWF).', v_amount - v_paid;
  end if;
  return new;
end;
$$;

drop trigger if exists debt_payments_check on public.debt_payments;
create trigger debt_payments_check
  before insert or update on public.debt_payments
  for each row execute function public.check_debt_payment();

-- ============================================================
-- SECURITY: only admins can see or change accounting
-- ============================================================

alter table public.money_entries enable row level security;
alter table public.debts enable row level security;
alter table public.debt_payments enable row level security;

revoke all on public.money_entries, public.debts, public.debt_payments from anon;
grant select, insert, update, delete on public.money_entries, public.debts, public.debt_payments to authenticated;

drop policy if exists "Admins manage money entries" on public.money_entries;
create policy "Admins manage money entries" on public.money_entries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage debts" on public.debts;
create policy "Admins manage debts" on public.debts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage debt payments" on public.debt_payments;
create policy "Admins manage debt payments" on public.debt_payments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create extension if not exists pgcrypto;

do $$
begin
  create type public.promotion_package_type as enum ('boost', 'featured');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.promotion_order_status as enum (
    'draft',
    'pending_review',
    'approved',
    'rejected',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.listing_promotion_status as enum (
    'scheduled',
    'active',
    'expired',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.promotion_packages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  type public.promotion_package_type not null,
  duration_days integer not null,
  price_cents integer not null,
  currency text not null default 'RON',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotion_packages_duration_positive check (duration_days > 0),
  constraint promotion_packages_price_nonnegative check (price_cents >= 0),
  constraint promotion_packages_currency_allowed check (currency in ('RON', 'EUR'))
);

create table if not exists public.promotion_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  package_id uuid not null references public.promotion_packages(id),
  status public.promotion_order_status not null default 'pending_review',
  amount_cents integer not null,
  currency text not null default 'RON',
  note text,
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotion_orders_amount_nonnegative check (amount_cents >= 0),
  constraint promotion_orders_currency_allowed check (currency in ('RON', 'EUR')),
  constraint promotion_orders_note_length check (note is null or char_length(note) <= 1200),
  constraint promotion_orders_admin_note_length check (admin_note is null or char_length(admin_note) <= 2000)
);

create table if not exists public.listing_promotions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id uuid not null references public.promotion_packages(id),
  order_id uuid references public.promotion_orders(id) on delete set null,
  type public.promotion_package_type not null,
  status public.listing_promotion_status not null default 'active',
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listing_promotions_valid_window check (ends_at > starts_at)
);

create index if not exists promotion_orders_user_id_idx on public.promotion_orders(user_id);
create index if not exists promotion_orders_listing_id_idx on public.promotion_orders(listing_id);
create index if not exists promotion_orders_status_idx on public.promotion_orders(status);
create index if not exists promotion_orders_created_at_idx on public.promotion_orders(created_at desc);

create index if not exists listing_promotions_listing_id_idx on public.listing_promotions(listing_id);
create index if not exists listing_promotions_user_id_idx on public.listing_promotions(user_id);
create index if not exists listing_promotions_status_idx on public.listing_promotions(status);
create index if not exists listing_promotions_starts_at_idx on public.listing_promotions(starts_at);
create index if not exists listing_promotions_ends_at_idx on public.listing_promotions(ends_at);

drop trigger if exists promotion_packages_set_updated_at on public.promotion_packages;
create trigger promotion_packages_set_updated_at
before update on public.promotion_packages
for each row execute function public.set_updated_at();

drop trigger if exists promotion_orders_set_updated_at on public.promotion_orders;
create trigger promotion_orders_set_updated_at
before update on public.promotion_orders
for each row execute function public.set_updated_at();

drop trigger if exists listing_promotions_set_updated_at on public.listing_promotions;
create trigger listing_promotions_set_updated_at
before update on public.listing_promotions
for each row execute function public.set_updated_at();

create or replace function public.expire_old_promotions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_rows integer;
begin
  update public.listing_promotions
  set status = 'expired', updated_at = now()
  where status = 'active'
    and ends_at < now();

  get diagnostics affected_rows = row_count;
  return affected_rows;
end;
$$;

insert into public.promotion_packages
  (code, name, description, type, duration_days, price_cents, currency, is_active, sort_order)
values
  ('boost_24h', 'Boost 24h', 'Anunțul tău apare mai sus în rezultate timp de 24 de ore.', 'boost', 1, 900, 'RON', true, 10),
  ('boost_7d', 'Boost 7 zile', 'Vizibilitate crescută pentru o săptămână.', 'boost', 7, 2900, 'RON', true, 20),
  ('featured_7d', 'Promovat 7 zile', 'Badge Promovat și poziționare prioritară în paginile relevante.', 'featured', 7, 4900, 'RON', true, 30),
  ('featured_30d', 'Promovat 30 zile', 'Vizibilitate extinsă pentru anunțuri importante.', 'featured', 30, 14900, 'RON', true, 40)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  type = excluded.type,
  duration_days = excluded.duration_days,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

alter table public.promotion_packages enable row level security;
alter table public.promotion_orders enable row level security;
alter table public.listing_promotions enable row level security;

drop policy if exists "Anyone can read active promotion packages" on public.promotion_packages;
create policy "Anyone can read active promotion packages"
on public.promotion_packages
for select
using (is_active = true);

drop policy if exists "Admins can read all promotion packages" on public.promotion_packages;
create policy "Admins can read all promotion packages"
on public.promotion_packages
for select
using (public.is_admin());

drop policy if exists "Admins can manage promotion packages" on public.promotion_packages;
create policy "Admins can manage promotion packages"
on public.promotion_packages
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read own promotion orders" on public.promotion_orders;
create policy "Users can read own promotion orders"
on public.promotion_orders
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Admins can read all promotion orders" on public.promotion_orders;
create policy "Admins can read all promotion orders"
on public.promotion_orders
for select
to authenticated
using (public.is_admin());

drop policy if exists "Users can create own promotion orders" on public.promotion_orders;
create policy "Users can create own promotion orders"
on public.promotion_orders
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'pending_review'
  and exists (
    select 1
    from public.listings l
    where l.id = promotion_orders.listing_id
      and l.user_id = auth.uid()
      and l.status = 'active'
  )
  and exists (
    select 1
    from public.promotion_packages p
    where p.id = promotion_orders.package_id
      and p.is_active = true
      and p.price_cents = promotion_orders.amount_cents
      and p.currency = promotion_orders.currency
  )
);

drop policy if exists "Users can cancel own pending promotion orders" on public.promotion_orders;
create policy "Users can cancel own pending promotion orders"
on public.promotion_orders
for update
to authenticated
using (user_id = auth.uid() and status = 'pending_review')
with check (user_id = auth.uid() and status = 'cancelled');

drop policy if exists "Admins can update promotion orders" on public.promotion_orders;
create policy "Admins can update promotion orders"
on public.promotion_orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Anyone can read active public listing promotions" on public.listing_promotions;
create policy "Anyone can read active public listing promotions"
on public.listing_promotions
for select
using (
  status = 'active'
  and starts_at <= now()
  and ends_at > now()
  and exists (
    select 1
    from public.listings l
    where l.id = listing_promotions.listing_id
      and l.status = 'active'
  )
);

drop policy if exists "Users can read own listing promotions" on public.listing_promotions;
create policy "Users can read own listing promotions"
on public.listing_promotions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Admins can read all listing promotions" on public.listing_promotions;
create policy "Admins can read all listing promotions"
on public.listing_promotions
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert listing promotions" on public.listing_promotions;
create policy "Admins can insert listing promotions"
on public.listing_promotions
for insert
to authenticated
with check (
  public.is_admin()
  and exists (
    select 1
    from public.listings l
    where l.id = listing_promotions.listing_id
      and l.user_id = listing_promotions.user_id
      and l.status = 'active'
  )
);

drop policy if exists "Admins can update listing promotions" on public.listing_promotions;
create policy "Admins can update listing promotions"
on public.listing_promotions
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

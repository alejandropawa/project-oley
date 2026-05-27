create extension if not exists pgcrypto;

do $$
begin
  create type public.listing_type as enum ('sell', 'buy', 'rent', 'swap');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.listing_status as enum ('draft', 'active', 'reserved', 'sold', 'expired', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.listing_condition as enum ('new', 'very_good', 'good', 'used', 'not_applicable');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.contact_preference as enum ('chat', 'phone', 'both');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  city text,
  county text,
  is_business boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_private_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  contact_preference public.contact_preference not null default 'chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null,
  category_slug text not null,
  subcategory text,
  type public.listing_type not null,
  condition public.listing_condition not null default 'not_applicable',
  status public.listing_status not null default 'active',
  price_cents integer,
  currency text not null default 'RON',
  is_negotiable boolean not null default false,
  city text not null,
  county text not null,
  contact_preference public.contact_preference not null default 'chat',
  search_document tsvector generated always as (
    setweight(to_tsvector('romanian', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('romanian', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('romanian', coalesce(city, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(category_slug, '')), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  expires_at timestamptz,
  constraint listings_price_cents_check check (price_cents is null or price_cents >= 0),
  constraint listings_currency_check check (currency in ('RON', 'EUR'))
);

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint listing_images_storage_path_check check (length(trim(storage_path)) > 0),
  constraint listing_images_listing_id_sort_order_key unique (listing_id, sort_order)
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_user_id_listing_id_key unique (user_id, listing_id)
);

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  query text,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_user_id_idx on public.listings(user_id);
create index if not exists listings_slug_idx on public.listings(slug);
create index if not exists listings_status_created_at_idx on public.listings(status, created_at desc);
create index if not exists listings_category_slug_idx on public.listings(category_slug);
create index if not exists listings_city_idx on public.listings(city);
create index if not exists listings_type_idx on public.listings(type);
create index if not exists listings_price_cents_idx on public.listings(price_cents);
create index if not exists listings_search_document_idx on public.listings using gin(search_document);
create index if not exists listing_images_listing_id_idx on public.listing_images(listing_id);
create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists favorites_listing_id_idx on public.favorites(listing_id);
create index if not exists saved_searches_user_id_idx on public.saved_searches(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists profile_private_settings_set_updated_at on public.profile_private_settings;
create trigger profile_private_settings_set_updated_at
before update on public.profile_private_settings
for each row execute function public.set_updated_at();

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

drop trigger if exists saved_searches_set_updated_at on public.saved_searches;
create trigger saved_searches_set_updated_at
before update on public.saved_searches
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;

  insert into public.profile_private_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.profile_private_settings enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.favorites enable row level security;
alter table public.saved_searches enable row level security;

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
on public.profiles for select
to public
using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Users can select own private settings" on public.profile_private_settings;
create policy "Users can select own private settings"
on public.profile_private_settings for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can insert own private settings" on public.profile_private_settings;
create policy "Users can insert own private settings"
on public.profile_private_settings for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own private settings" on public.profile_private_settings;
create policy "Users can update own private settings"
on public.profile_private_settings for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Active listings are publicly readable" on public.listings;
create policy "Active listings are publicly readable"
on public.listings for select
to public
using (status = 'active');

drop policy if exists "Users can read own listings" on public.listings;
create policy "Users can read own listings"
on public.listings for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can insert own listings" on public.listings;
create policy "Users can insert own listings"
on public.listings for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own listings" on public.listings;
create policy "Users can update own listings"
on public.listings for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete own listings" on public.listings;
create policy "Users can delete own listings"
on public.listings for delete
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Active listing images are publicly readable" on public.listing_images;
create policy "Active listing images are publicly readable"
on public.listing_images for select
to public
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and listings.status = 'active'
  )
);

drop policy if exists "Users can read own listing images" on public.listing_images;
create policy "Users can read own listing images"
on public.listing_images for select
to authenticated
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and listings.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can insert own listing images" on public.listing_images;
create policy "Users can insert own listing images"
on public.listing_images for insert
to authenticated
with check (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and listings.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can update own listing images" on public.listing_images;
create policy "Users can update own listing images"
on public.listing_images for update
to authenticated
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and listings.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and listings.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can delete own listing images" on public.listing_images;
create policy "Users can delete own listing images"
on public.listing_images for delete
to authenticated
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and listings.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can select own favorites" on public.favorites;
create policy "Users can select own favorites"
on public.favorites for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can insert own favorites" on public.favorites;
create policy "Users can insert own favorites"
on public.favorites for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete own favorites" on public.favorites;
create policy "Users can delete own favorites"
on public.favorites for delete
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can select own saved searches" on public.saved_searches;
create policy "Users can select own saved searches"
on public.saved_searches for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can insert own saved searches" on public.saved_searches;
create policy "Users can insert own saved searches"
on public.saved_searches for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own saved searches" on public.saved_searches;
create policy "Users can update own saved searches"
on public.saved_searches for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete own saved searches" on public.saved_searches;
create policy "Users can delete own saved searches"
on public.saved_searches for delete
to authenticated
using (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Anyone can read listing images" on storage.objects;
create policy "Anyone can read listing images"
on storage.objects for select
to public
using (bucket_id = 'listing-images');

drop policy if exists "Users can upload listing images to own folder" on storage.objects;
create policy "Users can upload listing images to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Users can update listing images in own folder" on storage.objects;
create policy "Users can update listing images in own folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Users can delete listing images in own folder" on storage.objects;
create policy "Users can delete listing images in own folder"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

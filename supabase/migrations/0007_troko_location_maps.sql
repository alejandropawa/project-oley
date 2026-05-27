create extension if not exists postgis;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'listing_location_precision') then
    create type public.listing_location_precision as enum (
      'city',
      'approximate',
      'exact_private'
    );
  end if;
end $$;

alter table public.listings
  add column if not exists latitude numeric(9,6),
  add column if not exists longitude numeric(9,6),
  add column if not exists public_latitude numeric(9,6),
  add column if not exists public_longitude numeric(9,6),
  add column if not exists location_precision public.listing_location_precision not null default 'city',
  add column if not exists location_label text,
  add column if not exists location geography(Point, 4326),
  add column if not exists public_location geography(Point, 4326);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'listings_latitude_range_check'
  ) then
    alter table public.listings
      add constraint listings_latitude_range_check
      check (latitude is null or (latitude >= -90 and latitude <= 90));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'listings_longitude_range_check'
  ) then
    alter table public.listings
      add constraint listings_longitude_range_check
      check (longitude is null or (longitude >= -180 and longitude <= 180));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'listings_public_latitude_range_check'
  ) then
    alter table public.listings
      add constraint listings_public_latitude_range_check
      check (public_latitude is null or (public_latitude >= -90 and public_latitude <= 90));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'listings_public_longitude_range_check'
  ) then
    alter table public.listings
      add constraint listings_public_longitude_range_check
      check (public_longitude is null or (public_longitude >= -180 and public_longitude <= 180));
  end if;
end $$;

create or replace function public.set_listing_location_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.location := st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  else
    new.location := null;
  end if;

  if new.public_latitude is not null and new.public_longitude is not null then
    new.public_location := st_setsrid(st_makepoint(new.public_longitude, new.public_latitude), 4326)::geography;
  else
    new.public_location := null;
  end if;

  return new;
end;
$$;

drop trigger if exists set_listing_location_points_trigger on public.listings;
create trigger set_listing_location_points_trigger
before insert or update on public.listings
for each row execute function public.set_listing_location_points();

create or replace function public.distance_km(point_a geography, point_b geography)
returns numeric
language sql
stable
set search_path = public
as $$
  select round((st_distance(point_a, point_b) / 1000)::numeric, 2);
$$;

create index if not exists listings_public_location_gist_idx
  on public.listings using gist(public_location);
create index if not exists listings_location_precision_idx
  on public.listings(location_precision);

update public.listings
set
  public_latitude = case public.normalize_romanian_slug(city)
    when 'bucuresti' then 44.426800
    when 'cluj-napoca' then 46.771200
    when 'iasi' then 47.158500
    when 'timisoara' then 45.748900
    when 'brasov' then 45.642700
    when 'constanta' then 44.159800
    when 'oradea' then 47.046500
    when 'sibiu' then 45.798300
    when 'craiova' then 44.330200
    when 'ploiesti' then 44.936700
    when 'arad' then 46.186600
    when 'galati' then 45.435300
    when 'pitesti' then 44.856500
    when 'suceava' then 47.651400
    when 'targu-mures' then 46.542500
    else public_latitude
  end,
  public_longitude = case public.normalize_romanian_slug(city)
    when 'bucuresti' then 26.102500
    when 'cluj-napoca' then 23.623600
    when 'iasi' then 27.601400
    when 'timisoara' then 21.208700
    when 'brasov' then 25.588700
    when 'constanta' then 28.634800
    when 'oradea' then 21.918900
    when 'sibiu' then 24.125600
    when 'craiova' then 23.794900
    when 'ploiesti' then 26.012900
    when 'arad' then 21.312300
    when 'galati' then 28.007800
    when 'pitesti' then 24.869200
    when 'suceava' then 26.255600
    when 'targu-mures' then 24.557500
    else public_longitude
  end,
  location_precision = coalesce(location_precision, 'city'::public.listing_location_precision)
where public_latitude is null
  or public_longitude is null;

update public.listings
set public_location = st_setsrid(st_makepoint(public_longitude, public_latitude), 4326)::geography
where public_latitude is not null
  and public_longitude is not null
  and public_location is null;

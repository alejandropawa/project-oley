create extension if not exists pg_trgm;
create extension if not exists unaccent;

create or replace function public.normalize_romanian_slug(input text)
returns text
language sql
immutable
set search_path = public
as $$
  select trim(both '-' from regexp_replace(
    regexp_replace(
      lower(
        translate(
          public.unaccent(coalesce(input, '')),
          'ăâîșşțţ',
          'aaisstt'
        )
      ),
      '[^a-z0-9]+',
      '-',
      'g'
    ),
    '-+',
    '-',
    'g'
  ));
$$;

alter table public.listings
  add column if not exists city_slug text,
  add column if not exists county_slug text,
  add column if not exists attributes jsonb not null default '{}'::jsonb,
  add column if not exists brand text,
  add column if not exists model text,
  add column if not exists year integer,
  add column if not exists search_text text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'listings_year_reasonable_check'
  ) then
    alter table public.listings
      add constraint listings_year_reasonable_check
      check (year is null or (year >= 1900 and year <= (date_part('year', now())::integer + 1)));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'listings_attributes_object_check'
  ) then
    alter table public.listings
      add constraint listings_attributes_object_check
      check (jsonb_typeof(attributes) = 'object');
  end if;
end $$;

create or replace function public.set_listing_search_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.city_slug := coalesce(nullif(new.city_slug, ''), public.normalize_romanian_slug(new.city));
  new.county_slug := coalesce(nullif(new.county_slug, ''), public.normalize_romanian_slug(new.county));
  new.search_text := trim(concat_ws(
    ' ',
    new.title,
    new.description,
    new.category_slug,
    new.subcategory,
    new.city,
    new.county,
    new.brand,
    new.model,
    new.attributes::text
  ));
  return new;
end;
$$;

drop trigger if exists set_listing_search_fields_trigger on public.listings;
create trigger set_listing_search_fields_trigger
before insert or update on public.listings
for each row execute function public.set_listing_search_fields();

update public.listings
set
  city_slug = public.normalize_romanian_slug(city),
  county_slug = public.normalize_romanian_slug(county),
  search_text = trim(concat_ws(
    ' ',
    title,
    description,
    category_slug,
    subcategory,
    city,
    county,
    brand,
    model,
    attributes::text
  ))
where city_slug is null
  or county_slug is null
  or search_text is null;

create index if not exists listings_city_slug_idx on public.listings(city_slug);
create index if not exists listings_county_slug_idx on public.listings(county_slug);
create index if not exists listings_brand_idx on public.listings(brand);
create index if not exists listings_model_idx on public.listings(model);
create index if not exists listings_year_idx on public.listings(year);
create index if not exists listings_attributes_gin_idx on public.listings using gin(attributes);
create index if not exists listings_title_trgm_idx on public.listings using gin(title gin_trgm_ops);
create index if not exists listings_description_trgm_idx on public.listings using gin(description gin_trgm_ops);
create index if not exists listings_search_text_trgm_idx on public.listings using gin(search_text gin_trgm_ops);

create table if not exists public.category_attribute_definitions (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null,
  key text not null,
  label text not null,
  type text not null,
  unit text,
  options jsonb not null default '[]'::jsonb,
  is_required boolean not null default false,
  is_filterable boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint category_attribute_definitions_unique_key unique (category_slug, key),
  constraint category_attribute_definitions_type_check check (
    type in ('text', 'number', 'select', 'multi_select', 'boolean', 'range')
  ),
  constraint category_attribute_definitions_key_check check (key ~ '^[a-z0-9_]+$'),
  constraint category_attribute_definitions_options_array_check check (jsonb_typeof(options) = 'array')
);

create index if not exists category_attribute_definitions_category_slug_idx
  on public.category_attribute_definitions(category_slug);
create index if not exists category_attribute_definitions_filterable_idx
  on public.category_attribute_definitions(is_filterable);

drop trigger if exists set_category_attribute_definitions_updated_at on public.category_attribute_definitions;
create trigger set_category_attribute_definitions_updated_at
before update on public.category_attribute_definitions
for each row execute function public.set_updated_at();

alter table public.category_attribute_definitions enable row level security;

drop policy if exists "Anyone can read category attribute definitions" on public.category_attribute_definitions;
create policy "Anyone can read category attribute definitions"
on public.category_attribute_definitions
for select
using (true);

drop policy if exists "Admins can insert category attribute definitions" on public.category_attribute_definitions;
create policy "Admins can insert category attribute definitions"
on public.category_attribute_definitions
for insert
with check (public.is_admin());

drop policy if exists "Admins can update category attribute definitions" on public.category_attribute_definitions;
create policy "Admins can update category attribute definitions"
on public.category_attribute_definitions
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete category attribute definitions" on public.category_attribute_definitions;
create policy "Admins can delete category attribute definitions"
on public.category_attribute_definitions
for delete
using (public.is_admin());

insert into public.category_attribute_definitions
  (category_slug, key, label, type, unit, options, is_required, is_filterable, sort_order)
values
  ('electronice', 'brand', 'Brand', 'text', null, '[]'::jsonb, false, true, 10),
  ('electronice', 'model', 'Model', 'text', null, '[]'::jsonb, false, true, 20),
  ('electronice', 'storage_gb', 'Stocare', 'select', 'GB', '["64","128","256","512","1024"]'::jsonb, false, true, 30),
  ('electronice', 'warranty', 'Garanție', 'boolean', null, '[]'::jsonb, false, true, 40),
  ('electronice', 'condition_detail', 'Detalii stare', 'select', null, '["Sigilat","Ca nou","Urme fine","Urme vizibile"]'::jsonb, false, true, 50),

  ('auto', 'brand', 'Marcă', 'text', null, '[]'::jsonb, false, true, 10),
  ('auto', 'model', 'Model', 'text', null, '[]'::jsonb, false, true, 20),
  ('auto', 'year', 'An', 'number', null, '[]'::jsonb, false, true, 30),
  ('auto', 'mileage_km', 'Kilometraj', 'number', 'km', '[]'::jsonb, false, true, 40),
  ('auto', 'fuel', 'Combustibil', 'select', null, '["Benzină","Diesel","Hibrid","Electric","GPL"]'::jsonb, false, true, 50),
  ('auto', 'transmission', 'Cutie viteze', 'select', null, '["Manuală","Automată"]'::jsonb, false, true, 60),

  ('imobiliare', 'rooms', 'Camere', 'select', null, '["1","2","3","4","5+"]'::jsonb, false, true, 10),
  ('imobiliare', 'surface_sqm', 'Suprafață', 'number', 'm²', '[]'::jsonb, false, true, 20),
  ('imobiliare', 'floor', 'Etaj', 'text', null, '[]'::jsonb, false, true, 30),
  ('imobiliare', 'property_type', 'Tip proprietate', 'select', null, '["Apartament","Garsonieră","Casă","Teren","Spațiu comercial"]'::jsonb, false, true, 40),
  ('imobiliare', 'furnished', 'Mobilat', 'select', null, '["Nemobilat","Parțial mobilat","Mobilat"]'::jsonb, false, true, 50),

  ('casa-gradina', 'material', 'Material', 'text', null, '[]'::jsonb, false, true, 10),
  ('casa-gradina', 'color', 'Culoare', 'text', null, '[]'::jsonb, false, true, 20),
  ('casa-gradina', 'dimensions', 'Dimensiuni', 'text', null, '[]'::jsonb, false, true, 30),
  ('casa-gradina', 'delivery_available', 'Livrare disponibilă', 'boolean', null, '[]'::jsonb, false, true, 40),

  ('fashion', 'brand', 'Brand', 'text', null, '[]'::jsonb, false, true, 10),
  ('fashion', 'size', 'Mărime', 'text', null, '[]'::jsonb, false, true, 20),
  ('fashion', 'gender', 'Pentru', 'select', null, '["Femei","Bărbați","Copii","Unisex"]'::jsonb, false, true, 30),
  ('fashion', 'color', 'Culoare', 'text', null, '[]'::jsonb, false, true, 40),

  ('sport', 'brand', 'Brand', 'text', null, '[]'::jsonb, false, true, 10),
  ('sport', 'sport_type', 'Sport', 'text', null, '[]'::jsonb, false, true, 20),
  ('sport', 'size', 'Mărime', 'text', null, '[]'::jsonb, false, true, 30),
  ('sport', 'warranty', 'Garanție', 'boolean', null, '[]'::jsonb, false, true, 40),

  ('copii-bebe', 'age_group', 'Vârstă', 'select', null, '["0-6 luni","6-12 luni","1-3 ani","3-6 ani","6+ ani"]'::jsonb, false, true, 10),
  ('copii-bebe', 'brand', 'Brand', 'text', null, '[]'::jsonb, false, true, 20),
  ('copii-bebe', 'safety_certified', 'Certificat siguranță', 'boolean', null, '[]'::jsonb, false, true, 30),

  ('servicii', 'service_type', 'Tip serviciu', 'text', null, '[]'::jsonb, false, true, 10),
  ('servicii', 'availability', 'Disponibilitate', 'text', null, '[]'::jsonb, false, true, 20),
  ('servicii', 'experience_years', 'Ani experiență', 'number', null, '[]'::jsonb, false, true, 30),

  ('inchirieri', 'rental_period', 'Perioadă', 'select', null, '["Oră","Zi","Săptămână","Lună"]'::jsonb, false, true, 10),
  ('inchirieri', 'deposit_required', 'Garanție necesară', 'boolean', null, '[]'::jsonb, false, true, 20),
  ('inchirieri', 'delivery_available', 'Livrare disponibilă', 'boolean', null, '[]'::jsonb, false, true, 30),

  ('schimburi', 'wanted_item', 'Ce cauți la schimb', 'text', null, '[]'::jsonb, false, true, 10),
  ('schimburi', 'accepts_difference', 'Accept diferență de bani', 'boolean', null, '[]'::jsonb, false, true, 20),
  ('schimburi', 'preferred_category', 'Categorie preferată', 'text', null, '[]'::jsonb, false, true, 30)
on conflict (category_slug, key) do update
set
  label = excluded.label,
  type = excluded.type,
  unit = excluded.unit,
  options = excluded.options,
  is_required = excluded.is_required,
  is_filterable = excluded.is_filterable,
  sort_order = excluded.sort_order,
  updated_at = now();

create table if not exists public.search_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  query text,
  filters jsonb not null default '{}'::jsonb,
  results_count integer,
  created_at timestamptz not null default now()
);

create index if not exists search_events_user_id_idx on public.search_events(user_id);
create index if not exists search_events_created_at_idx on public.search_events(created_at);

alter table public.search_events enable row level security;

drop policy if exists "Users can insert own search events" on public.search_events;
create policy "Users can insert own search events"
on public.search_events
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Admins can read search events" on public.search_events;
create policy "Admins can read search events"
on public.search_events
for select
using (public.is_admin());

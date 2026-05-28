create extension if not exists pgcrypto;

create or replace function public.normalize_auth_name(input text)
returns text
language sql
immutable
set search_path = public
as $$
  select nullif(
    trim(regexp_replace(regexp_replace(coalesce(input, ''), '[[:cntrl:]]', '', 'g'), '[[:space:]]+', ' ', 'g')),
    ''
  );
$$;

create table if not exists public.user_legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  accepted_terms_at timestamptz not null default now(),
  acknowledged_privacy_at timestamptz not null default now(),
  source text not null default 'auth_register',
  created_at timestamptz not null default now(),
  constraint user_legal_acceptances_terms_version_length check (char_length(terms_version) between 1 and 64),
  constraint user_legal_acceptances_privacy_version_length check (char_length(privacy_version) between 1 and 64),
  constraint user_legal_acceptances_source_length check (char_length(source) between 1 and 64),
  constraint user_legal_acceptances_unique_version unique (user_id, terms_version, privacy_version, source)
);

alter table public.user_legal_acceptances enable row level security;

create index if not exists user_legal_acceptances_user_id_idx
  on public.user_legal_acceptances(user_id);

create index if not exists user_legal_acceptances_accepted_terms_at_idx
  on public.user_legal_acceptances(accepted_terms_at desc);

alter table public.profiles
  drop constraint if exists profiles_display_name_security_check,
  add constraint profiles_display_name_security_check
    check (
      display_name is null
      or (
        char_length(trim(display_name)) between 2 and 80
        and display_name !~ '[[:cntrl:]]'
      )
    )
    not valid;

alter table public.profiles
  drop constraint if exists profiles_bio_length_check,
  add constraint profiles_bio_length_check
    check (bio is null or (char_length(bio) <= 600 and bio !~ '[[:cntrl:]]'))
    not valid;

alter table public.profiles
  drop constraint if exists profiles_public_location_label_length_check,
  add constraint profiles_public_location_label_length_check
    check (
      public_location_label is null
      or (char_length(public_location_label) <= 120 and public_location_label !~ '[[:cntrl:]]')
    )
    not valid;

alter table public.profiles
  drop constraint if exists profiles_location_length_check,
  add constraint profiles_location_length_check
    check (
      (city is null or (char_length(city) <= 80 and city !~ '[[:cntrl:]]'))
      and (county is null or (char_length(county) <= 80 and county !~ '[[:cntrl:]]'))
    )
    not valid;

alter table public.profiles
  drop constraint if exists profiles_avatar_url_length_check,
  add constraint profiles_avatar_url_length_check
    check (avatar_url is null or char_length(avatar_url) <= 2048)
    not valid;

alter table public.profile_private_settings
  drop constraint if exists profile_private_settings_phone_length_check,
  add constraint profile_private_settings_phone_length_check
    check (phone is null or (char_length(phone) <= 32 and phone !~ '[[:cntrl:]]'))
    not valid;

create or replace function public.validate_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_name text;
  accepted_terms boolean := false;
  terms_version text;
  privacy_version text;
begin
  new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  normalized_name := public.normalize_auth_name(new.raw_user_meta_data->>'full_name');

  if new.email is null
     or char_length(trim(new.email)) > 254
     or trim(new.email) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Emailul nu este valid.'
      using errcode = '23514';
  end if;

  if normalized_name is null or char_length(normalized_name) < 2 then
    raise exception 'Numele este obligatoriu.'
      using errcode = '23514';
  end if;

  if char_length(normalized_name) > 80 then
    raise exception 'Numele poate avea maximum 80 de caractere.'
      using errcode = '23514';
  end if;

  accepted_terms := case
    when jsonb_typeof(new.raw_user_meta_data->'acceptedTerms') = 'boolean'
      then (new.raw_user_meta_data->>'acceptedTerms')::boolean
    when jsonb_typeof(new.raw_user_meta_data->'acceptedTerms') = 'string'
      then lower(new.raw_user_meta_data->>'acceptedTerms') = 'true'
    else false
  end;

  if accepted_terms is not true then
    raise exception 'Acceptarea Termenilor și Condițiilor este necesară pentru crearea contului.'
      using errcode = '23514';
  end if;

  terms_version := left(coalesce(nullif(new.raw_user_meta_data->>'termsVersion', ''), '2026-05-28'), 64);
  privacy_version := left(coalesce(nullif(new.raw_user_meta_data->>'privacyVersion', ''), '2026-05-28'), 64);

  new.email := lower(trim(new.email));
  new.raw_user_meta_data := new.raw_user_meta_data || jsonb_build_object(
    'full_name', normalized_name,
    'acceptedTerms', true,
    'acceptedTermsAt', coalesce(new.created_at, now()),
    'termsVersion', terms_version,
    'privacyVersion', privacy_version
  );

  return new;
end;
$$;

drop trigger if exists validate_new_auth_user_before_insert on auth.users;
create trigger validate_new_auth_user_before_insert
before insert on auth.users
for each row execute function public.validate_new_auth_user();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
  next_slug text;
  accepted_at timestamptz;
  terms_version text;
  privacy_version text;
begin
  display_name := public.normalize_auth_name(new.raw_user_meta_data->>'full_name');
  accepted_at := coalesce(new.created_at, now());
  terms_version := left(coalesce(nullif(new.raw_user_meta_data->>'termsVersion', ''), '2026-05-28'), 64);
  privacy_version := left(coalesce(nullif(new.raw_user_meta_data->>'privacyVersion', ''), '2026-05-28'), 64);
  next_slug := public.profile_slug_from_name(coalesce(display_name, split_part(new.email, '@', 1), 'utilizator-troko'), new.id);

  insert into public.profiles (
    id,
    display_name,
    slug,
    email_verified_at
  )
  values (
    new.id,
    display_name,
    next_slug,
    case when new.email_confirmed_at is not null then new.email_confirmed_at else null end
  )
  on conflict (id) do update
  set display_name = coalesce(public.profiles.display_name, excluded.display_name),
      slug = coalesce(public.profiles.slug, excluded.slug),
      email_verified_at = coalesce(public.profiles.email_verified_at, excluded.email_verified_at);

  insert into public.profile_private_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_trust_badges (user_id, badge, label, description)
  values (
    new.id,
    'new_member',
    'Membru nou',
    'Utilizator nou pe TROKO.'
  )
  on conflict (user_id, badge) do nothing;

  insert into public.user_legal_acceptances (
    user_id,
    terms_version,
    privacy_version,
    accepted_terms_at,
    acknowledged_privacy_at,
    source
  )
  values (
    new.id,
    terms_version,
    privacy_version,
    accepted_at,
    accepted_at,
    'auth_register'
  )
  on conflict (user_id, terms_version, privacy_version, source) do nothing;

  return new;
end;
$$;

create or replace function public.protect_profile_sensitive_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  can_manage_sensitive boolean;
  next_profile_complete boolean;
begin
  can_manage_sensitive := coalesce(auth.role(), '') = 'service_role'
    or coalesce(current_setting('troko.internal_profile_update', true), '') = 'true'
    or public.is_admin((select auth.uid()));

  if can_manage_sensitive then
    return new;
  end if;

  if new.id is distinct from old.id
    or new.created_at is distinct from old.created_at
    or new.trust_score is distinct from old.trust_score
    or new.average_rating is distinct from old.average_rating
    or new.reviews_count is distinct from old.reviews_count
    or new.response_rate is distinct from old.response_rate
    or new.average_response_minutes is distinct from old.average_response_minutes
    or new.phone_verified_at is distinct from old.phone_verified_at
    or new.email_verified_at is distinct from old.email_verified_at
    or new.is_verified_seller is distinct from old.is_verified_seller
    then
    raise exception 'Actualizarea câmpurilor de încredere este permisă doar prin fluxuri securizate.'
      using errcode = '42501';
  end if;

  if new.profile_completed_at is not null
    and new.profile_completed_at is distinct from old.profile_completed_at then
    next_profile_complete :=
      nullif(new.display_name, '') is not null
      and nullif(new.city, '') is not null
      and nullif(new.county, '') is not null
      and nullif(new.bio, '') is not null;

    if not next_profile_complete then
      raise exception 'Profilul nu poate fi marcat drept complet fără informațiile obligatorii.'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_sensitive_columns on public.profiles;
create trigger profiles_protect_sensitive_columns
before update on public.profiles
for each row execute function public.protect_profile_sensitive_columns();

create or replace function public.recalculate_user_rating(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  next_average numeric(3,2);
  next_count integer;
begin
  select round(avg(rating)::numeric, 2), count(*)::integer
  into next_average, next_count
  from public.user_reviews
  where reviewed_user_id = target_user_id
    and status = 'published';

  perform set_config('troko.internal_profile_update', 'true', true);

  update public.profiles
  set average_rating = next_average,
      reviews_count = coalesce(next_count, 0),
      updated_at = now()
  where id = target_user_id;
end;
$$;

create or replace function public.update_profile_trust_score(target_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  score integer := 0;
  profile_row public.profiles%rowtype;
  active_listing_count integer := 0;
begin
  select * into profile_row from public.profiles where id = target_user_id;

  if not found then
    return 0;
  end if;

  if profile_row.email_verified_at is not null then
    score := score + 20;
  end if;

  if profile_row.phone_verified_at is not null then
    score := score + 25;
  end if;

  if profile_row.profile_completed_at is not null or public.calculate_profile_completion(target_user_id) then
    score := score + 20;
  end if;

  select count(*)::integer into active_listing_count
  from public.listings
  where user_id = target_user_id and status = 'active';

  if active_listing_count > 0 then
    score := score + 10;
  end if;

  if coalesce(profile_row.average_rating, 0) >= 4.5 and profile_row.reviews_count >= 3 then
    score := score + 15;
  end if;

  if coalesce(profile_row.response_rate, 0) >= 80 and coalesce(profile_row.average_response_minutes, 999999) <= 180 then
    score := score + 10;
  end if;

  score := least(score, 100);

  perform set_config('troko.internal_profile_update', 'true', true);

  update public.profiles
  set trust_score = score,
      updated_at = now()
  where id = target_user_id;

  return score;
end;
$$;

create or replace function public.sync_profile_email_verified_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is distinct from old.email_confirmed_at then
    perform set_config('troko.internal_profile_update', 'true', true);

    update public.profiles
    set email_verified_at = new.email_confirmed_at,
        updated_at = now()
    where id = new.id;

    perform public.update_profile_trust_score(new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists sync_profile_email_verified_after_auth_update on auth.users;
create trigger sync_profile_email_verified_after_auth_update
after update of email_confirmed_at on auth.users
for each row execute function public.sync_profile_email_verified_at();

select set_config('troko.internal_profile_update', 'true', true);

update public.profiles
set email_verified_at = auth_users.email_confirmed_at
from auth.users auth_users
where public.profiles.id = auth_users.id
  and public.profiles.email_verified_at is null
  and auth_users.email_confirmed_at is not null;

do $$
declare
  profile_id uuid;
begin
  for profile_id in select id from public.profiles loop
    perform public.update_profile_trust_score(profile_id);
  end loop;
end $$;

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles"
on public.profiles for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Users can read own legal acceptances" on public.user_legal_acceptances;
create policy "Users can read own legal acceptances"
on public.user_legal_acceptances for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Admins can read legal acceptances" on public.user_legal_acceptances;
create policy "Admins can read legal acceptances"
on public.user_legal_acceptances for select
to authenticated
using (public.is_admin((select auth.uid())));

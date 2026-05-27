create extension if not exists pgcrypto;

do $$
begin
  create type public.verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.trust_badge_code as enum (
    'email_verified',
    'phone_verified',
    'profile_complete',
    'fast_responder',
    'trusted_seller',
    'business_seller',
    'top_rated',
    'new_member'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.review_status as enum ('published', 'pending_review', 'hidden', 'removed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.review_context as enum ('listing_conversation', 'manual_admin', 'other');
exception
  when duplicate_object then null;
end $$;

alter type public.notification_type add value if not exists 'review_received';
alter type public.notification_type add value if not exists 'verification_approved';
alter type public.notification_type add value if not exists 'verification_rejected';
alter type public.notification_type add value if not exists 'trust_badge_awarded';

alter table public.profiles
  add column if not exists slug text unique,
  add column if not exists bio text,
  add column if not exists public_location_label text,
  add column if not exists profile_completed_at timestamptz,
  add column if not exists phone_verified_at timestamptz,
  add column if not exists email_verified_at timestamptz,
  add column if not exists trust_score integer not null default 0,
  add column if not exists average_rating numeric(3,2),
  add column if not exists reviews_count integer not null default 0,
  add column if not exists response_rate integer,
  add column if not exists average_response_minutes integer,
  add column if not exists last_seen_at timestamptz,
  add column if not exists is_verified_seller boolean not null default false;

alter table public.profiles
  drop constraint if exists profiles_trust_score_range,
  add constraint profiles_trust_score_range check (trust_score between 0 and 100);

alter table public.profiles
  drop constraint if exists profiles_average_rating_range,
  add constraint profiles_average_rating_range check (average_rating is null or (average_rating >= 1 and average_rating <= 5));

alter table public.profiles
  drop constraint if exists profiles_reviews_count_positive,
  add constraint profiles_reviews_count_positive check (reviews_count >= 0);

alter table public.profiles
  drop constraint if exists profiles_response_rate_range,
  add constraint profiles_response_rate_range check (response_rate is null or (response_rate >= 0 and response_rate <= 100));

alter table public.profiles
  drop constraint if exists profiles_average_response_minutes_positive,
  add constraint profiles_average_response_minutes_positive check (average_response_minutes is null or average_response_minutes >= 0);

create index if not exists profiles_slug_idx on public.profiles(slug);
create index if not exists profiles_trust_score_idx on public.profiles(trust_score);
create index if not exists profiles_average_rating_idx on public.profiles(average_rating);
create index if not exists profiles_reviews_count_idx on public.profiles(reviews_count);
create index if not exists profiles_is_verified_seller_idx on public.profiles(is_verified_seller);

create table if not exists public.user_reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewed_user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  rating integer not null,
  comment text,
  context public.review_context not null default 'listing_conversation',
  status public.review_status not null default 'published',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_reviews_not_self check (reviewer_id <> reviewed_user_id),
  constraint user_reviews_rating_range check (rating between 1 and 5),
  constraint user_reviews_comment_length check (comment is null or char_length(comment) <= 1200)
);

create unique index if not exists user_reviews_unique_listing_context_idx
  on public.user_reviews(reviewer_id, reviewed_user_id, listing_id)
  where listing_id is not null;

create unique index if not exists user_reviews_unique_conversation_context_idx
  on public.user_reviews(reviewer_id, reviewed_user_id, conversation_id)
  where conversation_id is not null;

create index if not exists user_reviews_reviewer_id_idx on public.user_reviews(reviewer_id);
create index if not exists user_reviews_reviewed_user_id_idx on public.user_reviews(reviewed_user_id);
create index if not exists user_reviews_listing_id_idx on public.user_reviews(listing_id);
create index if not exists user_reviews_conversation_id_idx on public.user_reviews(conversation_id);
create index if not exists user_reviews_status_idx on public.user_reviews(status);
create index if not exists user_reviews_rating_idx on public.user_reviews(rating);
create index if not exists user_reviews_created_at_idx on public.user_reviews(created_at desc);

create table if not exists public.user_trust_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge public.trust_badge_code not null,
  label text not null,
  description text,
  awarded_at timestamptz not null default now(),
  expires_at timestamptz,
  awarded_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  constraint user_trust_badges_unique unique (user_id, badge)
);

create index if not exists user_trust_badges_user_id_idx on public.user_trust_badges(user_id);
create index if not exists user_trust_badges_badge_idx on public.user_trust_badges(badge);
create index if not exists user_trust_badges_awarded_at_idx on public.user_trust_badges(awarded_at desc);

create table if not exists public.profile_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  status public.verification_status not null default 'pending',
  submitted_data jsonb not null default '{}'::jsonb,
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_verification_requests_type_check check (type in ('phone', 'business', 'seller'))
);

create index if not exists profile_verification_requests_user_id_idx on public.profile_verification_requests(user_id);
create index if not exists profile_verification_requests_type_idx on public.profile_verification_requests(type);
create index if not exists profile_verification_requests_status_idx on public.profile_verification_requests(status);
create index if not exists profile_verification_requests_created_at_idx on public.profile_verification_requests(created_at desc);

create table if not exists public.onboarding_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_events_user_id_idx on public.onboarding_events(user_id);
create index if not exists onboarding_events_event_idx on public.onboarding_events(event);
create index if not exists onboarding_events_created_at_idx on public.onboarding_events(created_at desc);

drop trigger if exists set_user_reviews_updated_at on public.user_reviews;
create trigger set_user_reviews_updated_at
before update on public.user_reviews
for each row execute function public.set_updated_at();

drop trigger if exists set_profile_verification_requests_updated_at on public.profile_verification_requests;
create trigger set_profile_verification_requests_updated_at
before update on public.profile_verification_requests
for each row execute function public.set_updated_at();

create or replace function public.profile_slug_from_name(name text, user_id uuid)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  base_slug text;
  suffix text;
begin
  base_slug := public.normalize_romanian_slug(coalesce(nullif(name, ''), 'utilizator-troko'));
  suffix := left(replace(user_id::text, '-', ''), 6);
  return trim(both '-' from concat(base_slug, '-', suffix));
end;
$$;

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

  update public.profiles
  set average_rating = next_average,
      reviews_count = coalesce(next_count, 0),
      updated_at = now()
  where id = target_user_id;
end;
$$;

create or replace function public.update_user_review_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_user_rating(old.reviewed_user_id);
    return old;
  end if;

  perform public.recalculate_user_rating(new.reviewed_user_id);

  if tg_op = 'UPDATE' and old.reviewed_user_id <> new.reviewed_user_id then
    perform public.recalculate_user_rating(old.reviewed_user_id);
  end if;

  return new;
end;
$$;

drop trigger if exists recalculate_user_rating_after_review_change on public.user_reviews;
create trigger recalculate_user_rating_after_review_change
after insert or update or delete on public.user_reviews
for each row execute function public.update_user_review_rating();

create or replace function public.calculate_profile_completion(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = target_user_id
      and nullif(display_name, '') is not null
      and nullif(city, '') is not null
      and nullif(county, '') is not null
      and nullif(bio, '') is not null
  );
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

  update public.profiles
  set trust_score = score,
      updated_at = now()
  where id = target_user_id;

  return score;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
  next_slug text;
begin
  display_name := nullif(new.raw_user_meta_data->>'full_name', '');
  next_slug := public.profile_slug_from_name(coalesce(display_name, split_part(new.email, '@', 1), 'utilizator-troko'), new.id);

  insert into public.profiles (id, display_name, slug, email_verified_at)
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

  return new;
end;
$$;

update public.profiles
set slug = public.profile_slug_from_name(coalesce(display_name, 'utilizator-troko'), id)
where slug is null;

insert into public.user_trust_badges (user_id, badge, label, description)
select id, 'new_member', 'Membru nou', 'Utilizator nou pe TROKO.'
from public.profiles
on conflict (user_id, badge) do nothing;

create or replace function public.notification_preference_enabled(
  target_user_id uuid,
  notification_kind notification_type,
  channel notification_channel
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select case
        when channel = 'in_app' and notification_kind::text = 'message_received' then in_app_messages
        when channel = 'email' and notification_kind::text = 'message_received' then email_messages
        when channel = 'in_app' and notification_kind::text in ('listing_favorited', 'listing_status_changed') then in_app_listing_activity
        when channel = 'email' and notification_kind::text in ('listing_favorited', 'listing_status_changed') then email_listing_activity
        when channel = 'in_app' and notification_kind::text = 'saved_search_match' then in_app_saved_searches
        when channel = 'email' and notification_kind::text = 'saved_search_match' then email_saved_searches
        when channel = 'in_app' and notification_kind::text in ('promotion_order_created', 'promotion_order_approved', 'promotion_order_rejected', 'promotion_expiring') then in_app_promotions
        when channel = 'email' and notification_kind::text in ('promotion_order_created', 'promotion_order_approved', 'promotion_order_rejected', 'promotion_expiring') then email_promotions
        when channel = 'in_app' and notification_kind::text in ('report_submitted', 'report_status_changed', 'verification_approved', 'verification_rejected', 'trust_badge_awarded', 'review_received') then in_app_moderation
        when channel = 'email' and notification_kind::text in ('report_submitted', 'report_status_changed', 'verification_approved', 'verification_rejected', 'trust_badge_awarded', 'review_received') then email_moderation
        when channel = 'in_app' and notification_kind::text = 'system_announcement' then in_app_system
        when channel = 'email' and notification_kind::text = 'system_announcement' then email_system
        else true
      end
      from public.notification_preferences
      where user_id = target_user_id
    ),
    true
  );
$$;

alter table public.user_reviews enable row level security;
alter table public.user_trust_badges enable row level security;
alter table public.profile_verification_requests enable row level security;
alter table public.onboarding_events enable row level security;

drop policy if exists "Anyone can read published reviews" on public.user_reviews;
create policy "Anyone can read published reviews"
on public.user_reviews for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Users can read own reviews" on public.user_reviews;
create policy "Users can read own reviews"
on public.user_reviews for select
to authenticated
using (reviewer_id = (select auth.uid()) or reviewed_user_id = (select auth.uid()));

drop policy if exists "Admins can read all reviews" on public.user_reviews;
create policy "Admins can read all reviews"
on public.user_reviews for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Users can create contextual reviews" on public.user_reviews;
create policy "Users can create contextual reviews"
on public.user_reviews for insert
to authenticated
with check (
  reviewer_id = (select auth.uid())
  and reviewer_id <> reviewed_user_id
  and (
    (
      conversation_id is not null
      and exists (
        select 1
        from public.conversations
        where conversations.id = user_reviews.conversation_id
          and (conversations.buyer_id = (select auth.uid()) or conversations.seller_id = (select auth.uid()))
          and (conversations.buyer_id = user_reviews.reviewed_user_id or conversations.seller_id = user_reviews.reviewed_user_id)
      )
    )
    or public.is_admin((select auth.uid()))
  )
);

drop policy if exists "Users can update own visible reviews" on public.user_reviews;
create policy "Users can update own visible reviews"
on public.user_reviews for update
to authenticated
using (reviewer_id = (select auth.uid()) and status in ('published', 'pending_review'))
with check (reviewer_id = (select auth.uid()) and status in ('published', 'pending_review'));

drop policy if exists "Admins can update all reviews" on public.user_reviews;
create policy "Admins can update all reviews"
on public.user_reviews for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Anyone can read active trust badges" on public.user_trust_badges;
create policy "Anyone can read active trust badges"
on public.user_trust_badges for select
to anon, authenticated
using (expires_at is null or expires_at > now());

drop policy if exists "Admins can manage trust badges" on public.user_trust_badges;
create policy "Admins can manage trust badges"
on public.user_trust_badges for all
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Users can read own verification requests" on public.profile_verification_requests;
create policy "Users can read own verification requests"
on public.profile_verification_requests for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can create own verification requests" on public.profile_verification_requests;
create policy "Users can create own verification requests"
on public.profile_verification_requests for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own pending verification requests" on public.profile_verification_requests;
create policy "Users can update own pending verification requests"
on public.profile_verification_requests for update
to authenticated
using (user_id = (select auth.uid()) and status = 'pending')
with check (user_id = (select auth.uid()) and status = 'pending');

drop policy if exists "Admins can read verification requests" on public.profile_verification_requests;
create policy "Admins can read verification requests"
on public.profile_verification_requests for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update verification requests" on public.profile_verification_requests;
create policy "Admins can update verification requests"
on public.profile_verification_requests for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Users can read own onboarding events" on public.onboarding_events;
create policy "Users can read own onboarding events"
on public.onboarding_events for select
to authenticated
using (user_id = (select auth.uid()) or public.is_admin((select auth.uid())));

drop policy if exists "Users can insert own onboarding events" on public.onboarding_events;
create policy "Users can insert own onboarding events"
on public.onboarding_events for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Admins can update trust fields on profiles" on public.profiles;
create policy "Admins can update trust fields on profiles"
on public.profiles for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

grant execute on function public.recalculate_user_rating(uuid) to authenticated;
grant execute on function public.calculate_profile_completion(uuid) to authenticated;
grant execute on function public.update_profile_trust_score(uuid) to authenticated;

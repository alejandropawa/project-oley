create extension if not exists pgcrypto;

do $$
begin
  create type notification_type as enum (
    'message_received',
    'listing_favorited',
    'listing_status_changed',
    'saved_search_match',
    'promotion_order_created',
    'promotion_order_approved',
    'promotion_order_rejected',
    'promotion_expiring',
    'report_submitted',
    'report_status_changed',
    'system_announcement'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type notification_channel as enum ('in_app', 'email');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type email_delivery_status as enum ('queued', 'sent', 'skipped', 'failed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text not null,
  action_url text,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_title_length check (char_length(title) between 1 and 160),
  constraint notifications_body_length check (char_length(body) between 1 and 1000),
  constraint notifications_action_url_internal check (
    action_url is null
    or (
      action_url like '/%'
      and action_url not like '//%'
      and position('://' in action_url) = 0
    )
  )
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_messages boolean not null default true,
  email_listing_activity boolean not null default true,
  email_saved_searches boolean not null default true,
  email_promotions boolean not null default true,
  email_moderation boolean not null default true,
  email_system boolean not null default true,
  in_app_messages boolean not null default true,
  in_app_listing_activity boolean not null default true,
  in_app_saved_searches boolean not null default true,
  in_app_promotions boolean not null default true,
  in_app_moderation boolean not null default true,
  in_app_system boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  notification_id uuid references public.notifications(id) on delete set null,
  type notification_type not null,
  to_email text,
  subject text not null,
  status email_delivery_status not null default 'queued',
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists notifications_user_id_created_at_idx
on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_id_read_at_idx
on public.notifications (user_id, read_at);

create index if not exists notifications_type_idx
on public.notifications (type);

create index if not exists email_events_user_id_idx
on public.email_events (user_id);

create index if not exists email_events_notification_id_idx
on public.email_events (notification_id);

create index if not exists email_events_status_idx
on public.email_events (status);

create index if not exists email_events_created_at_idx
on public.email_events (created_at desc);

drop trigger if exists notification_preferences_set_updated_at on public.notification_preferences;
create trigger notification_preferences_set_updated_at
before update on public.notification_preferences
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

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

insert into public.notification_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;

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
        when channel = 'in_app' and notification_kind = 'message_received' then in_app_messages
        when channel = 'email' and notification_kind = 'message_received' then email_messages
        when channel = 'in_app' and notification_kind in ('listing_favorited', 'listing_status_changed') then in_app_listing_activity
        when channel = 'email' and notification_kind in ('listing_favorited', 'listing_status_changed') then email_listing_activity
        when channel = 'in_app' and notification_kind = 'saved_search_match' then in_app_saved_searches
        when channel = 'email' and notification_kind = 'saved_search_match' then email_saved_searches
        when channel = 'in_app' and notification_kind in ('promotion_order_created', 'promotion_order_approved', 'promotion_order_rejected', 'promotion_expiring') then in_app_promotions
        when channel = 'email' and notification_kind in ('promotion_order_created', 'promotion_order_approved', 'promotion_order_rejected', 'promotion_expiring') then email_promotions
        when channel = 'in_app' and notification_kind in ('report_submitted', 'report_status_changed') then in_app_moderation
        when channel = 'email' and notification_kind in ('report_submitted', 'report_status_changed') then email_moderation
        when channel = 'in_app' and notification_kind = 'system_announcement' then in_app_system
        when channel = 'email' and notification_kind = 'system_announcement' then email_system
        else true
      end
      from public.notification_preferences
      where user_id = target_user_id
    ),
    true
  );
$$;

grant execute on function public.notification_preference_enabled(uuid, notification_type, notification_channel) to authenticated;

alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.email_events enable row level security;

drop policy if exists "Users can select own notifications" on public.notifications;
create policy "Users can select own notifications"
on public.notifications for select
to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
on public.notifications for update
to authenticated
using (user_id = (select auth.uid()) or public.is_admin())
with check (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications"
on public.notifications for delete
to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Scoped notification inserts" on public.notifications;
create policy "Scoped notification inserts"
on public.notifications for insert
to authenticated
with check (
  public.is_admin()
  or (
    user_id = (select auth.uid())
    and type in ('promotion_order_created', 'report_submitted')
  )
  or (
    type = 'message_received'
    and user_id <> (select auth.uid())
    and data ? 'conversation_id'
    and (data->>'conversation_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and exists (
      select 1
      from public.conversations c
      where c.id = (data->>'conversation_id')::uuid
        and c.status = 'active'
        and (
          (c.buyer_id = (select auth.uid()) and c.seller_id = user_id)
          or (c.seller_id = (select auth.uid()) and c.buyer_id = user_id)
        )
    )
  )
  or (
    type = 'listing_favorited'
    and user_id <> (select auth.uid())
    and data ? 'listing_id'
    and (data->>'listing_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and exists (
      select 1
      from public.listings l
      where l.id = (data->>'listing_id')::uuid
        and l.user_id = user_id
        and l.user_id <> (select auth.uid())
    )
  )
);

drop policy if exists "Users can select own notification preferences" on public.notification_preferences;
create policy "Users can select own notification preferences"
on public.notification_preferences for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can insert own notification preferences" on public.notification_preferences;
create policy "Users can insert own notification preferences"
on public.notification_preferences for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own notification preferences" on public.notification_preferences;
create policy "Users can update own notification preferences"
on public.notification_preferences for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Admins can select email events" on public.email_events;
create policy "Admins can select email events"
on public.email_events for select
to authenticated
using (public.is_admin());

drop policy if exists "Authenticated server flows can insert email events" on public.email_events;
create policy "Authenticated server flows can insert email events"
on public.email_events for insert
to authenticated
with check ((select auth.uid()) is not null);

drop policy if exists "Admins can update email events" on public.email_events;
create policy "Admins can update email events"
on public.email_events for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

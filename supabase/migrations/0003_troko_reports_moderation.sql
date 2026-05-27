do $$
begin
  create type public.report_entity_type as enum ('listing', 'conversation', 'message', 'user');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.report_reason as enum (
    'fraud',
    'spam',
    'duplicate',
    'wrong_category',
    'inappropriate',
    'prohibited',
    'harassment',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.report_status as enum ('open', 'in_review', 'resolved', 'dismissed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.moderation_action_type as enum (
    'report_created',
    'report_in_review',
    'report_resolved',
    'report_dismissed',
    'note_added',
    'listing_archived',
    'listing_reactivated',
    'listing_expired',
    'listing_deleted',
    'user_reviewed',
    'conversation_reviewed',
    'message_reviewed'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  entity_type public.report_entity_type not null,
  reason public.report_reason not null,
  status public.report_status not null default 'open',
  description text,
  listing_id uuid references public.listings(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  message_id uuid references public.messages(id) on delete cascade,
  reported_user_id uuid references auth.users(id) on delete cascade,
  assigned_admin_id uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_description_length_check check (
    description is null or length(description) <= 2000
  ),
  constraint reports_target_check check (
    (
      entity_type = 'listing'
      and listing_id is not null
      and conversation_id is null
      and message_id is null
      and reported_user_id is null
    )
    or (
      entity_type = 'conversation'
      and listing_id is null
      and conversation_id is not null
      and message_id is null
      and reported_user_id is null
    )
    or (
      entity_type = 'message'
      and listing_id is null
      and conversation_id is null
      and message_id is not null
      and reported_user_id is null
    )
    or (
      entity_type = 'user'
      and listing_id is null
      and conversation_id is null
      and message_id is null
      and reported_user_id is not null
    )
  ),
  constraint reports_not_self_user_check check (
    reported_user_id is null or reporter_id <> reported_user_id
  )
);

create table if not exists public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete set null,
  admin_id uuid references auth.users(id) on delete set null,
  action public.moderation_action_type not null,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reports_reporter_id_idx on public.reports(reporter_id);
create index if not exists reports_entity_type_idx on public.reports(entity_type);
create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_reason_idx on public.reports(reason);
create index if not exists reports_listing_id_idx on public.reports(listing_id);
create index if not exists reports_conversation_id_idx on public.reports(conversation_id);
create index if not exists reports_message_id_idx on public.reports(message_id);
create index if not exists reports_reported_user_id_idx on public.reports(reported_user_id);
create index if not exists reports_created_at_idx on public.reports(created_at desc);
create index if not exists moderation_events_report_id_idx on public.moderation_events(report_id);
create index if not exists moderation_events_admin_id_idx on public.moderation_events(admin_id);
create index if not exists moderation_events_action_idx on public.moderation_events(action);
create index if not exists moderation_events_created_at_idx on public.moderation_events(created_at desc);

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

create or replace function public.log_report_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.moderation_events (report_id, admin_id, action, metadata)
  values (
    new.id,
    null,
    'report_created',
    jsonb_build_object('entity_type', new.entity_type, 'reason', new.reason)
  );

  return new;
end;
$$;

drop trigger if exists reports_log_created on public.reports;
create trigger reports_log_created
after insert on public.reports
for each row execute function public.log_report_created();

create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where admin_users.user_id = $1
  );
$$;

alter table public.admin_users enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_events enable row level security;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
on public.admin_users for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Users can create own reports" on public.reports;
create policy "Users can create own reports"
on public.reports for insert
to authenticated
with check (
  reporter_id = (select auth.uid())
  and (
    (
      entity_type = 'listing'
      and exists (
        select 1
        from public.listings
        where listings.id = reports.listing_id
          and listings.user_id <> (select auth.uid())
          and (
            listings.status = 'active'
            or listings.user_id = (select auth.uid())
            or public.is_admin((select auth.uid()))
          )
      )
    )
    or (
      entity_type = 'conversation'
      and exists (
        select 1
        from public.conversations
        where conversations.id = reports.conversation_id
          and (
            conversations.buyer_id = (select auth.uid())
            or conversations.seller_id = (select auth.uid())
          )
      )
    )
    or (
      entity_type = 'message'
      and exists (
        select 1
        from public.messages
        join public.conversations on conversations.id = messages.conversation_id
        where messages.id = reports.message_id
          and messages.sender_id <> (select auth.uid())
          and (
            conversations.buyer_id = (select auth.uid())
            or conversations.seller_id = (select auth.uid())
          )
      )
    )
    or (
      entity_type = 'user'
      and reported_user_id <> (select auth.uid())
    )
  )
);

drop policy if exists "Users can read own reports" on public.reports;
create policy "Users can read own reports"
on public.reports for select
to authenticated
using (reporter_id = (select auth.uid()));

drop policy if exists "Admins can read all reports" on public.reports;
create policy "Admins can read all reports"
on public.reports for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update reports" on public.reports;
create policy "Admins can update reports"
on public.reports for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can read moderation events" on public.moderation_events;
create policy "Admins can read moderation events"
on public.moderation_events for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can insert moderation events" on public.moderation_events;
create policy "Admins can insert moderation events"
on public.moderation_events for insert
to authenticated
with check (
  public.is_admin((select auth.uid()))
  and admin_id = (select auth.uid())
);

drop policy if exists "Admins can read all listings" on public.listings;
create policy "Admins can read all listings"
on public.listings for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update listings for moderation" on public.listings;
create policy "Admins can update listings for moderation"
on public.listings for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can read all conversations" on public.conversations;
create policy "Admins can read all conversations"
on public.conversations for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can read all messages" on public.messages;
create policy "Admins can read all messages"
on public.messages for select
to authenticated
using (public.is_admin((select auth.uid())));

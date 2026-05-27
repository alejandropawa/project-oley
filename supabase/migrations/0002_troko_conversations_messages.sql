do $$
begin
  create type public.conversation_status as enum ('active', 'archived', 'blocked');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  status public.conversation_status not null default 'active',
  last_message_at timestamptz,
  last_message_preview text,
  last_message_sender_id uuid references auth.users(id) on delete set null,
  buyer_last_read_at timestamptz,
  seller_last_read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_buyer_seller_check check (buyer_id <> seller_id),
  constraint conversations_listing_buyer_seller_key unique (listing_id, buyer_id, seller_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  constraint messages_body_length_check check (
    length(trim(body)) between 1 and 2000
  )
);

create index if not exists conversations_listing_id_idx on public.conversations(listing_id);
create index if not exists conversations_buyer_id_idx on public.conversations(buyer_id);
create index if not exists conversations_seller_id_idx on public.conversations(seller_id);
create index if not exists conversations_last_message_at_idx on public.conversations(last_message_at desc nulls last);
create index if not exists conversations_status_idx on public.conversations(status);
create index if not exists messages_conversation_id_created_at_idx on public.messages(conversation_id, created_at);
create index if not exists messages_sender_id_idx on public.messages(sender_id);

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

create or replace function public.update_conversation_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set
    last_message_at = new.created_at,
    last_message_preview = left(new.body, 160),
    last_message_sender_id = new.sender_id,
    updated_at = now()
  where id = new.conversation_id;

  return new;
end;
$$;

drop trigger if exists messages_update_conversation_last_message on public.messages;
create trigger messages_update_conversation_last_message
after insert on public.messages
for each row execute function public.update_conversation_last_message();

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

revoke update on public.conversations from anon, authenticated;
grant update (status, buyer_last_read_at, seller_last_read_at)
on public.conversations to authenticated;

drop policy if exists "Participants can read conversations" on public.conversations;
create policy "Participants can read conversations"
on public.conversations for select
to authenticated
using (
  buyer_id = (select auth.uid())
  or seller_id = (select auth.uid())
);

drop policy if exists "Buyers can start conversations for active listings" on public.conversations;
create policy "Buyers can start conversations for active listings"
on public.conversations for insert
to authenticated
with check (
  buyer_id = (select auth.uid())
  and seller_id <> (select auth.uid())
  and exists (
    select 1
    from public.listings
    where listings.id = conversations.listing_id
      and listings.user_id = conversations.seller_id
      and listings.status = 'active'
  )
);

drop policy if exists "Participants can update conversations" on public.conversations;
create policy "Participants can update conversations"
on public.conversations for update
to authenticated
using (
  buyer_id = (select auth.uid())
  or seller_id = (select auth.uid())
)
with check (
  buyer_id = (select auth.uid())
  or seller_id = (select auth.uid())
);

drop policy if exists "Participants can read messages" on public.messages;
create policy "Participants can read messages"
on public.messages for select
to authenticated
using (
  exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and (
        conversations.buyer_id = (select auth.uid())
        or conversations.seller_id = (select auth.uid())
      )
  )
);

drop policy if exists "Participants can send active conversation messages" on public.messages;
create policy "Participants can send active conversation messages"
on public.messages for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and conversations.status = 'active'
      and (
        conversations.buyer_id = (select auth.uid())
        or conversations.seller_id = (select auth.uid())
      )
  )
);

drop policy if exists "Conversation participants can read listing context" on public.listings;
create policy "Conversation participants can read listing context"
on public.listings for select
to authenticated
using (
  exists (
    select 1
    from public.conversations
    where conversations.listing_id = listings.id
      and (
        conversations.buyer_id = (select auth.uid())
        or conversations.seller_id = (select auth.uid())
      )
  )
);

drop policy if exists "Conversation participants can read listing image context" on public.listing_images;
create policy "Conversation participants can read listing image context"
on public.listing_images for select
to authenticated
using (
  exists (
    select 1
    from public.conversations
    join public.listings on listings.id = conversations.listing_id
    where listings.id = listing_images.listing_id
      and (
        conversations.buyer_id = (select auth.uid())
        or conversations.seller_id = (select auth.uid())
      )
  )
);

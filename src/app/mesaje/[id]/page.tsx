import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ConversationHeader } from "@/components/inbox/conversation-header";
import { EmptyInboxState } from "@/components/inbox/empty-inbox-state";
import { InboxLayout } from "@/components/inbox/inbox-layout";
import { MessageComposer } from "@/components/inbox/message-composer";
import { MessageThread } from "@/components/inbox/message-thread";
import { SafetyChatCard } from "@/components/inbox/safety-chat-card";
import { ReviewDialog } from "@/components/reviews/review-dialog";
import { SitePageShell } from "@/components/site/page-shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getAuthDrawerPath } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/user";
import {
  getConversationById,
  markConversationAsRead,
} from "@/lib/db/conversations";
import { isSupabaseConfigured } from "@/lib/db/env";
import { getInboxSummary } from "@/lib/db/inbox";
import { getConversationMessages } from "@/lib/db/messages";
import { createClient } from "@/lib/supabase/server";

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: {
    absolute: "Conversație — TROKO",
  },
  description: "Conversație privată TROKO despre un anunț.",
};

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { id } = await params;
  const configured = isSupabaseConfigured();

  if (!configured) {
    return (
      <ConversationFrame>
        <EmptyInboxState
          title="Mesageria va fi disponibilă după configurarea Supabase."
          description="Aplică migrarea pentru conversații și mesaje înainte de a deschide conversații reale."
          showCta={false}
        />
      </ConversationFrame>
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect(getAuthDrawerPath("login", `/mesaje/${id}`));
  }

  const supabase = await createClient();
  const [inbox, detail] = await Promise.all([
    getInboxSummary(user.id, supabase),
    getConversationById(id, user.id, supabase),
  ]);

  if (inbox.source === "unavailable" || detail.source === "unavailable") {
    return (
      <ConversationFrame>
        <EmptyInboxState
          title="Nu am putut încărca mesageria."
          description="Verifică dacă migrarea pentru conversații și mesaje a fost aplicată în Supabase."
          showCta={false}
        />
      </ConversationFrame>
    );
  }

  if (!detail.conversation) {
    notFound();
  }

  await markConversationAsRead(id, user.id, supabase);

  const messagesResult = await getConversationMessages(id, user.id, supabase);

  if (messagesResult.source === "unavailable") {
    return (
      <ConversationFrame>
        <EmptyInboxState
          title="Nu am putut încărca mesajele."
          description="Verifică dacă tabela de mesaje există și politicile RLS sunt aplicate."
          showCta={false}
        />
      </ConversationFrame>
    );
  }

  const hasCurrentUserMessage = messagesResult.messages.some(
    (message) => message.sender_id === user.id,
  );
  const hasOtherUserMessage = messagesResult.messages.some(
    (message) => message.sender_id !== user.id,
  );
  const canReview = hasCurrentUserMessage && hasOtherUserMessage;

  return (
    <ConversationFrame>
      <InboxLayout conversations={inbox.conversations} selectedId={id}>
        <div className="grid gap-5">
          <ConversationHeader conversation={detail.conversation} />
          {detail.conversation.listing.status !== "active" ? (
            <div className="rounded-[1.25rem] border border-warm/45 bg-secondary p-4 text-sm font-semibold leading-6 text-warm-foreground">
              Anunțul nu mai este activ. Poți continua o conversație existentă,
              dar nu porni tranzacții noi fără verificări suplimentare.
            </div>
          ) : null}
          <MessageThread messages={messagesResult.messages} />
          <SafetyChatCard conversationId={id} />
          {canReview ? (
            <ReviewDialog
              reviewedUserId={detail.conversation.otherParticipant.id}
              conversationId={id}
              listingId={detail.conversation.listing.id}
            />
          ) : null}
          <MessageComposer
            conversationId={id}
            disabled={detail.conversation.status !== "active"}
          />
        </div>
      </InboxLayout>
    </ConversationFrame>
  );
}

function ConversationFrame({ children }: { children: React.ReactNode }) {
  return (
    <SitePageShell>
      <main className="relative isolate overflow-hidden">
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
            <Breadcrumbs
              items={[
                { label: "Acasă", href: "/" },
                { label: "Mesaje", href: "/mesaje" },
                { label: "Conversație" },
              ]}
            />
          </div>
        </section>

        <section className="py-6 sm:py-8">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
            {children}
          </div>
        </section>
      </main>
    </SitePageShell>
  );
}

import Link from "next/link";
import { Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  conversationStatusLabels,
  formatMessageTime,
  getConversationInitial,
  listingStatusLabels,
} from "@/lib/inbox-utils";
import { cn } from "@/lib/utils";
import type { ConversationSummary } from "@/lib/db/conversations";

export function ConversationListItem({
  conversation,
  selected = false,
}: {
  conversation: ConversationSummary;
  selected?: boolean;
}) {
  const listingStatus =
    listingStatusLabels[conversation.listing.status] ?? conversation.listing.status;

  return (
    <Link
      href={`/mesaje/${conversation.id}`}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "grid grid-cols-[64px_1fr] gap-3 rounded-[1.25rem] border p-3 transition hover:border-primary/40 hover:bg-background",
        selected
          ? "border-primary/40 bg-brand-soft"
          : "border-border bg-card",
      )}
    >
      <div
        className="grid size-16 place-items-center overflow-hidden rounded-[1rem] bg-muted text-lg font-semibold text-primary"
        style={
          conversation.listing.imageUrl
            ? {
                backgroundImage: `url(${conversation.listing.imageUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }
            : undefined
        }
      >
        {!conversation.listing.imageUrl
          ? getConversationInitial(conversation.listing.title)
          : null}
      </div>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {conversation.listing.title}
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-muted-foreground">
              {conversation.otherParticipant.displayName}
            </p>
          </div>
          {conversation.isUnread ? (
            <span className="inline-flex min-w-6 shrink-0 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              {conversation.unreadCount}
            </span>
          ) : (
            <Circle
              className="mt-1 size-2 shrink-0 fill-border text-border"
              aria-hidden="true"
            />
          )}
        </div>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {conversation.lastMessagePreview || "Conversație pregătită."}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-muted px-2 py-0.5 text-[0.68rem] font-semibold text-primary">
            {listingStatus}
          </Badge>
          {conversation.status !== "active" ? (
            <Badge className="rounded-full bg-background px-2 py-0.5 text-[0.68rem] font-semibold text-muted-foreground">
              {conversationStatusLabels[conversation.status]}
            </Badge>
          ) : null}
          <span className="text-[0.7rem] font-semibold text-muted-foreground">
            {formatMessageTime(conversation.lastMessageAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

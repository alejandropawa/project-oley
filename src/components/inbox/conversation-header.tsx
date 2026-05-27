import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  conversationStatusLabels,
  formatConversationPrice,
  getConversationInitial,
  listingStatusLabels,
} from "@/lib/inbox-utils";
import type { ConversationDetail } from "@/lib/db/conversations";

export function ConversationHeader({
  conversation,
}: {
  conversation: ConversationDetail;
}) {
  const listing = conversation.listing;
  const listingStatus = listingStatusLabels[listing.status] ?? listing.status;

  return (
    <header className="rounded-[1.75rem] border border-border bg-card p-4 shadow-soft-sm">
      <Button
        asChild
        variant="ghost"
        className="mb-3 h-10 rounded-full px-3 font-bold text-muted-foreground lg:hidden"
      >
        <Link href="/mesaje">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Înapoi la mesaje
        </Link>
      </Button>

      <div className="flex gap-4">
        <div
          className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-[1.25rem] bg-muted text-2xl font-black text-primary"
          style={
            listing.imageUrl
              ? {
                  backgroundImage: `url(${listing.imageUrl})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }
              : undefined
          }
        >
          {!listing.imageUrl ? getConversationInitial(listing.title) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">
              {listingStatus}
            </Badge>
            {conversation.status !== "active" ? (
              <Badge className="rounded-full bg-background px-3 py-1 text-xs font-bold text-muted-foreground">
                {conversationStatusLabels[conversation.status]}
              </Badge>
            ) : null}
          </div>

          <Link
            href={`/anunturi/${listing.slug}`}
            className="mt-3 block text-xl font-black leading-tight text-foreground transition hover:text-primary"
          >
            {listing.title}
          </Link>
          <p className="mt-1 text-lg font-black text-primary">
            {formatConversationPrice(listing)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              {listing.city}
            </span>
            <span>Cu {conversation.otherParticipant.displayName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

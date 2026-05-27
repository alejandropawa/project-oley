import { ConversationListItem } from "@/components/inbox/conversation-list-item";
import type { ConversationSummary } from "@/lib/db/conversations";

export function ConversationList({
  conversations,
  selectedId,
}: {
  conversations: ConversationSummary[];
  selectedId?: string;
}) {
  return (
    <aside className="rounded-[1.75rem] border border-border bg-card p-3 shadow-soft-sm">
      <div className="px-2 pb-3 pt-1">
        <p className="text-xs font-bold uppercase text-primary">Inbox</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">Mesaje</h2>
      </div>
      <div className="grid gap-2">
        {conversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            selected={conversation.id === selectedId}
          />
        ))}
      </div>
    </aside>
  );
}

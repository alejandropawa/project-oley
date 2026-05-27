import { ConversationList } from "@/components/inbox/conversation-list";
import type { ConversationSummary } from "@/lib/db/conversations";

export function InboxLayout({
  conversations,
  selectedId,
  children,
}: {
  conversations: ConversationSummary[];
  selectedId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[390px_1fr] lg:items-start">
      <div className={selectedId ? "hidden lg:block" : undefined}>
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
        />
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

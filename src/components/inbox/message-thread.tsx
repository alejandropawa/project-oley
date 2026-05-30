import { MessageBubble } from "@/components/inbox/message-bubble";
import type { ConversationMessage } from "@/lib/db/messages";

export function MessageThread({
  messages,
}: {
  messages: ConversationMessage[];
}) {
  if (messages.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-border bg-card p-6 text-center shadow-soft-sm">
        <h2 className="text-xl font-semibold text-foreground">
          Începe conversația
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Scrie un mesaj scurt și clar. Întrebările despre disponibilitate,
          livrare sau schimburi merg cel mai bine aici.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Fir de mesaje"
      className="grid gap-3 rounded-[1.75rem] border border-border bg-background p-3 shadow-soft-sm sm:p-5"
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </section>
  );
}

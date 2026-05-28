import { AlertTriangle } from "lucide-react";

import { ReportButton } from "@/components/reports/report-button";
import { formatMessageTime } from "@/lib/inbox-utils";
import { cn } from "@/lib/utils";
import type { ConversationMessage } from "@/lib/db/messages";

export function MessageBubble({ message }: { message: ConversationMessage }) {
  return (
    <article
      className={cn(
        "flex",
        message.isCurrentUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[88%] rounded-[1.25rem] px-4 py-3 shadow-soft-sm sm:max-w-[72%]",
          message.isCurrentUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border bg-card text-foreground",
        )}
      >
        <p className="whitespace-pre-line text-sm leading-6">{message.body}</p>
        <p
          className={cn(
            "mt-2 text-[0.7rem] font-semibold",
            message.isCurrentUser
              ? "text-primary-foreground/80"
              : "text-muted-foreground",
          )}
        >
          {formatMessageTime(message.created_at)}
        </p>

        {message.safetyHints.length > 0 ? (
          <div
            className={cn(
              "mt-3 grid gap-1 rounded-[0.9rem] p-2 text-xs font-semibold",
              message.isCurrentUser
                ? "bg-white/12 text-primary-foreground"
                : "bg-secondary text-warm-foreground",
            )}
          >
            {message.safetyHints.map((hint) => (
              <span key={hint} className="inline-flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" aria-hidden="true" />
                {hint}
              </span>
            ))}
          </div>
        ) : null}
        {!message.isCurrentUser ? (
          <div className="mt-2">
            <ReportButton
              entityType="message"
              entityId={message.id}
              isAuthenticated
              loginHref="/?auth=login&redirectTo=/mesaje"
              buttonLabel="Raportează mesaj"
              successMessage="Mesajul a fost raportat."
              compact
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

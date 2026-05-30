"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Send } from "lucide-react";

import { sendMessageAction } from "@/app/actions/messages";
import { QuickReplies } from "@/components/inbox/quick-replies";
import { Button } from "@/components/ui/button";

export function MessageComposer({
  conversationId,
  disabled = false,
}: {
  conversationId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function insertQuickReply(reply: string) {
    setBody((current) => {
      const separator = current.trim() ? "\n" : "";
      return `${current}${separator}${reply}`;
    });
    setError("");
  }

  function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanBody = body.trim();

    setError("");

    if (!cleanBody) {
      setError("Scrie un mesaj înainte de trimitere.");
      return;
    }

    if (cleanBody.length > 2000) {
      setError("Mesajul poate avea maximum 2000 de caractere.");
      return;
    }

    startTransition(async () => {
      const result = await sendMessageAction({
        conversationId,
        body: cleanBody,
      });

      if (!result.success) {
        setError(result.error ?? "Nu am putut trimite mesajul.");
        return;
      }

      setBody("");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={submitMessage}
      className="sticky bottom-20 rounded-[1.75rem] border border-border bg-card p-4 shadow-soft md:bottom-4"
    >
      <QuickReplies onSelect={insertQuickReply} />

      <label className="mt-3 block">
        <span className="sr-only">Mesaj</span>
        <textarea
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
            setError("");
          }}
          disabled={disabled || isPending}
          maxLength={2000}
          rows={3}
          placeholder="Scrie mesajul tău..."
          className="min-h-24 w-full resize-y rounded-[1.25rem] border border-input bg-background px-4 py-3 text-base leading-6 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
        />
      </label>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-muted-foreground">
          {body.length}/2000 caractere
        </p>
        <Button
          disabled={disabled || isPending}
          className="h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground"
        >
          <Send className="size-4" aria-hidden="true" />
          {isPending ? "Se trimite..." : "Trimite"}
        </Button>
      </div>

      {error ? (
        <p className="mt-3 rounded-[1rem] border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
}

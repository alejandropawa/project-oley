"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  addModerationNoteAction,
  moderateListingAction,
  updateReportStatusAction,
} from "@/app/actions/admin-moderation";
import { Button } from "@/components/ui/button";

export function ReportStatusActionButton({
  reportId,
  status,
  children,
}: {
  reportId: string;
  status: "in_review" | "resolved" | "dismissed";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <Button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError("");
          startTransition(async () => {
            const result = await updateReportStatusAction({ reportId, status });
            if (!result.success) {
              setError(result.error ?? "Acțiunea a eșuat.");
              return;
            }
            router.refresh();
          });
        }}
        variant={status === "dismissed" ? "outline" : undefined}
        className={
          status === "dismissed"
            ? "h-11 rounded-full border-border bg-background px-4 font-semibold"
            : "h-11 rounded-full bg-primary px-4 font-semibold text-primary-foreground"
        }
      >
        {isPending ? "Se salvează..." : children}
      </Button>
      {error ? <p className="mt-2 text-xs font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}

export function ListingModerationButton({
  listingId,
  reportId,
  action,
  children,
}: {
  listingId: string;
  reportId?: string | null;
  action: "archive" | "reactivate" | "expire";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function runAction() {
    const confirmed = window.confirm("Confirmi această acțiune de moderare?");

    if (!confirmed) {
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await moderateListingAction({ listingId, reportId, action });

      if (!result.success) {
        setError(result.error ?? "Acțiunea a eșuat.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div>
      <Button
        type="button"
        disabled={isPending}
        onClick={runAction}
        variant={action === "reactivate" ? undefined : "outline"}
        className={
          action === "reactivate"
            ? "h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
            : "h-10 rounded-full border-border bg-background px-4 text-sm font-semibold"
        }
      >
        {isPending ? "Se salvează..." : children}
      </Button>
      {error ? <p className="mt-2 text-xs font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}

export function ModerationNoteForm({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    startTransition(async () => {
      const result = await addModerationNoteAction({ reportId, note });

      if (!result.success) {
        setError(result.error ?? "Nu am putut adăuga nota.");
        return;
      }

      setNote("");
      setMessage("Nota internă a fost adăugată.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submitNote} className="grid gap-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-foreground">
          Notă internă
        </span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Adaugă observații pentru echipa TROKO."
          className="min-h-28 w-full resize-y rounded-[1rem] border border-input bg-background px-3 py-3 text-base leading-6 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
      {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
      {message ? <p className="text-sm font-semibold text-primary">{message}</p> : null}
      <Button
        disabled={isPending}
        className="h-11 w-fit rounded-full bg-primary px-5 font-semibold text-primary-foreground"
      >
        {isPending ? "Se salvează..." : "Adaugă notă internă"}
      </Button>
    </form>
  );
}

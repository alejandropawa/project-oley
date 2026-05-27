"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Flag, X } from "lucide-react";

import { submitReportAction } from "@/app/actions/reports";
import { Button } from "@/components/ui/button";
import { reportReasonOptions } from "@/lib/reporting-utils";
import type { Enums } from "@/types/database";

export function ReportButton({
  entityType,
  entityId,
  isAuthenticated,
  loginHref,
  disabledReason,
  buttonLabel,
  successMessage = "Îți mulțumim. Echipa TROKO va analiza raportarea.",
  compact = false,
}: {
  entityType: Enums<"report_entity_type">;
  entityId: string;
  isAuthenticated: boolean;
  loginHref: string;
  disabledReason?: string;
  buttonLabel?: string;
  successMessage?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Enums<"report_reason">>("fraud");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <Button
        asChild
        variant={compact ? "ghost" : "outline"}
        className={
          compact
            ? "h-8 rounded-full px-3 text-xs font-bold text-muted-foreground"
            : "h-11 rounded-full border-border bg-background px-5 font-bold"
        }
      >
        <Link href={loginHref}>
          <Flag className="size-4" aria-hidden="true" />
          {buttonLabel ?? "Raportează"}
        </Link>
      </Button>
    );
  }

  if (disabledReason) {
    return (
      <p className="rounded-[1rem] border border-border bg-background p-3 text-sm font-semibold text-muted-foreground">
        {disabledReason}
      </p>
    );
  }

  function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    startTransition(async () => {
      const result = await submitReportAction({
        entityType,
        entityId,
        reason,
        description,
      });

      if (!result.success) {
        setError(result.error ?? "Nu am putut trimite raportarea.");
        return;
      }

      setSuccess(successMessage);
      setDescription("");
    });
  }

  return (
    <>
      <Button
        type="button"
        variant={compact ? "ghost" : "outline"}
        onClick={() => {
          setOpen(true);
          setError("");
          setSuccess("");
        }}
        className={
          compact
            ? "h-8 rounded-full px-3 text-xs font-bold text-muted-foreground"
            : "h-11 rounded-full border-border bg-background px-5 font-bold"
        }
      >
        <Flag className="size-4" aria-hidden="true" />
        {buttonLabel ?? "Raportează"}
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/35 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`report-title-${entityId}`}
        >
          <div className="w-full max-w-lg rounded-[1.75rem] border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id={`report-title-${entityId}`}
                  className="text-2xl font-black text-foreground"
                >
                  Trimite raportarea
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Spune-ne ce pare în neregulă. Echipa TROKO va analiza
                  raportarea.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Închide dialogul de raportare"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-background text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={submitReport} className="mt-5 grid gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-foreground">
                  Motiv
                </span>
                <select
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value as Enums<"report_reason">)
                  }
                  className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {reportReasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-foreground">
                  Descriere opțională
                </span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={2000}
                  rows={5}
                  placeholder="Adaugă detalii care ne pot ajuta să analizăm mai repede."
                  className="min-h-32 w-full resize-y rounded-[1rem] border border-input bg-background px-3 py-3 text-base leading-6 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                <span className="mt-1 block text-xs font-semibold text-muted-foreground">
                  {description.length}/2000 caractere
                </span>
              </label>

              {error ? (
                <p className="rounded-[1rem] border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                  {error}
                </p>
              ) : null}

              {success ? (
                <p className="rounded-[1rem] border border-[#D5E4DF] bg-[#E8F1EE] p-3 text-sm font-semibold text-primary">
                  {success}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="h-11 rounded-full px-5 font-bold text-muted-foreground"
                >
                  Închide
                </Button>
                <Button
                  disabled={isPending}
                  className="h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground"
                >
                  {isPending ? "Se trimite..." : "Trimite raportarea"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

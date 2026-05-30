"use client";

import { useState, useTransition } from "react";

import {
  approvePromotionOrderAction,
  expireListingPromotionAction,
  rejectPromotionOrderAction,
} from "@/app/actions/admin-promotions";
import { Button } from "@/components/ui/button";

export function AdminPromotionOrderActions({
  orderId,
  disabled,
}: {
  orderId: string;
  disabled?: boolean;
}) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function approve() {
    setMessage("");
    setError("");

    if (!window.confirm("Activezi promovarea pentru acest anunț?")) {
      return;
    }

    startTransition(async () => {
      const result = await approvePromotionOrderAction({ orderId });

      if (!result.success) {
        setError(result.error ?? "Nu am putut aproba solicitarea.");
        return;
      }

      setMessage("Promovarea a fost activată.");
    });
  }

  function reject() {
    setMessage("");
    setError("");

    if (!adminNote.trim()) {
      setError("Scrie o notă internă pentru respingere.");
      return;
    }

    if (!window.confirm("Respingi solicitarea de promovare?")) {
      return;
    }

    startTransition(async () => {
      const result = await rejectPromotionOrderAction({
        orderId,
        adminNote,
      });

      if (!result.success) {
        setError(result.error ?? "Nu am putut respinge solicitarea.");
        return;
      }

      setIsRejecting(false);
      setAdminNote("");
      setMessage("Solicitarea a fost respinsă.");
    });
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          onClick={approve}
          disabled={disabled || isPending}
          className="h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          {isPending ? "Se procesează..." : "Aprobă"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsRejecting((value) => !value)}
          disabled={disabled || isPending}
          className="h-10 rounded-full border-border bg-background px-4 text-sm font-semibold"
        >
          Respinge
        </Button>
      </div>

      {isRejecting ? (
        <div className="grid gap-2 rounded-[1rem] border border-border bg-background p-3">
          <label className="text-sm font-semibold text-foreground" htmlFor={`reject-${orderId}`}>
            Notă internă
          </label>
          <textarea
            id={`reject-${orderId}`}
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            rows={3}
            maxLength={2000}
            className="min-h-24 w-full rounded-[1rem] border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder="Motivul respingerii pentru istoricul intern."
          />
          <Button
            type="button"
            onClick={reject}
            disabled={isPending}
            className="h-10 w-fit rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Confirmă respingerea
          </Button>
        </div>
      ) : null}

      {message ? <p className="text-sm font-semibold text-primary">{message}</p> : null}
      {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}

export function AdminExpirePromotionButton({
  promotionId,
}: {
  promotionId: string;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function expire() {
    setMessage("");
    setError("");

    if (!window.confirm("Marchezi această promovare ca expirată?")) {
      return;
    }

    startTransition(async () => {
      const result = await expireListingPromotionAction({ promotionId });

      if (!result.success) {
        setError(result.error ?? "Nu am putut expira promovarea.");
        return;
      }

      setMessage("Promovarea a fost marcată ca expirată.");
    });
  }

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={expire}
        disabled={isPending}
        className="h-10 rounded-full border-border bg-background px-4 text-sm font-semibold"
      >
        {isPending ? "Se actualizează..." : "Expiră"}
      </Button>
      {message ? <p className="text-xs font-semibold text-primary">{message}</p> : null}
      {error ? <p className="text-xs font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}

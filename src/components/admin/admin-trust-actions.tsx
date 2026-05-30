"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  approveVerificationRequestAction,
  awardTrustedSellerBadgeAction,
  rejectVerificationRequestAction,
  removeTrustedSellerBadgeAction,
  updateReviewStatusForAdminAction,
} from "@/app/actions/admin-trust";
import { Button } from "@/components/ui/button";
import type { Enums } from "@/types/database";

export function VerificationAdminActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function run(action: "approve" | "reject") {
    const note =
      action === "reject"
        ? window.prompt("Nota interna pentru respingere") ?? ""
        : "";

    startTransition(async () => {
      const result =
        action === "approve"
          ? await approveVerificationRequestAction(requestId)
          : await rejectVerificationRequestAction(requestId, note);

      if (!result.success) {
        setMessage(result.error ?? "Actiunea a esuat.");
        return;
      }

      setMessage("Actualizat.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        disabled={isPending}
        onClick={() => run("approve")}
        className="h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
      >
        Aproba
      </Button>
      <Button
        type="button"
        disabled={isPending}
        onClick={() => run("reject")}
        variant="outline"
        className="h-10 rounded-full px-4 text-sm font-semibold"
      >
        Respinge
      </Button>
      {message ? (
        <p className="w-full text-xs font-semibold text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function ReviewAdminActions({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function run(status: Enums<"review_status">) {
    const adminNote =
      status === "published" ? "" : window.prompt("Nota interna") ?? "";

    startTransition(async () => {
      const result = await updateReviewStatusForAdminAction({
        reviewId,
        status,
        adminNote,
      });

      if (!result.success) {
        setMessage(result.error ?? "Actiunea a esuat.");
        return;
      }

      setMessage("Actualizat.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        disabled={isPending}
        onClick={() => run("published")}
        className="h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
      >
        Publica
      </Button>
      <Button
        type="button"
        disabled={isPending}
        onClick={() => run("hidden")}
        variant="outline"
        className="h-10 rounded-full px-4 text-sm font-semibold"
      >
        Ascunde
      </Button>
      <Button
        type="button"
        disabled={isPending}
        onClick={() => run("removed")}
        variant="outline"
        className="h-10 rounded-full px-4 text-sm font-semibold"
      >
        Elimina
      </Button>
      {message ? (
        <p className="w-full text-xs font-semibold text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function TrustedSellerBadgeButton({
  userId,
  mode,
}: {
  userId: string;
  mode: "award" | "remove";
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <Button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const result =
              mode === "award"
                ? await awardTrustedSellerBadgeAction(userId)
                : await removeTrustedSellerBadgeAction(userId);

            if (!result.success) {
              setMessage(result.error ?? "Actiunea a esuat.");
              return;
            }

            setMessage("Actualizat.");
            router.refresh();
          });
        }}
        variant={mode === "award" ? undefined : "outline"}
        className={
          mode === "award"
            ? "h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
            : "h-10 rounded-full px-4 text-sm font-semibold"
        }
      >
        {mode === "award" ? "Acorda trusted seller" : "Scoate badge"}
      </Button>
      {message ? (
        <p className="mt-2 text-xs font-semibold text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}


"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, MessageCircle, Store } from "lucide-react";

import { startConversationAction } from "@/app/actions/conversations";
import { Button } from "@/components/ui/button";

export function ContactSellerButton({
  listingId,
  listingSlug,
  isAuthenticated,
  isOwner,
  canUseMessaging,
  listingStatus = "active",
}: {
  listingId: string;
  listingSlug: string;
  isAuthenticated: boolean;
  isOwner: boolean;
  canUseMessaging: boolean;
  listingStatus?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const loginHref = `/login?redirectTo=/anunturi/${listingSlug}`;

  if (!isAuthenticated) {
    return (
      <div className="grid gap-2">
        <Button className="h-12 rounded-full bg-primary px-5 font-bold text-primary-foreground" asChild>
          <Link href={loginHref}>
            <MessageCircle className="size-4" aria-hidden="true" />
            Trimite mesaj
          </Link>
        </Button>
        <p className="text-xs font-semibold text-muted-foreground">
          Intră în cont pentru a trimite mesaj vânzătorului.
        </p>
      </div>
    );
  }

  if (isOwner) {
    return (
      <Button
        asChild
        variant="outline"
        className="h-12 rounded-full border-border bg-background px-5 font-bold"
      >
        <Link href="/cont/anunturi">
          <Store className="size-4" aria-hidden="true" />
          Acesta este anunțul tău
        </Link>
      </Button>
    );
  }

  if (!canUseMessaging) {
    return (
      <div className="rounded-[1rem] border border-[#F3D88D] bg-[#FFF2CF] p-3 text-sm font-semibold leading-6 text-[#7A5718]">
        Mesageria va fi disponibilă după configurarea Supabase.
      </div>
    );
  }

  function startConversation() {
    setError("");
    startTransition(async () => {
      const result = await startConversationAction({ listingId });

      if (!result.success || !result.redirectUrl) {
        setError(result.error ?? "Nu am putut porni conversația.");
        return;
      }

      router.push(result.redirectUrl);
    });
  }

  return (
    <div className="grid gap-2">
      {listingStatus !== "active" ? (
        <p className="rounded-[1rem] border border-[#F3D88D] bg-[#FFF2CF] p-3 text-sm font-semibold leading-6 text-[#7A5718]">
          Anunțul nu mai este activ.
        </p>
      ) : null}
      <Button
        type="button"
        onClick={startConversation}
        disabled={isPending}
        className="h-12 rounded-full bg-primary px-5 font-bold text-primary-foreground"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <MessageCircle className="size-4" aria-hidden="true" />
        )}
        {isPending
          ? "Se deschide..."
          : listingStatus === "active"
            ? "Trimite mesaj"
            : "Deschide conversația"}
      </Button>
      {error ? (
        <p className="rounded-[1rem] border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useState, useTransition } from "react";

import { toggleFavoriteAction } from "@/app/actions/favorites";
import { Button } from "@/components/ui/button";

export function FavoriteButton({
  listingId,
  isAuthenticated,
}: {
  listingId: string;
  isAuthenticated: boolean;
}) {
  const [favorited, setFavorited] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <Button
        asChild
        variant="outline"
        className="h-12 rounded-full border-border bg-background px-5 font-bold"
      >
        <Link href="/login?redirectTo=/cont/favorite">
          <Heart className="size-4" aria-hidden="true" />
          Salvează
        </Link>
      </Button>
    );
  }

  function toggle() {
    setError("");
    startTransition(async () => {
      const result = await toggleFavoriteAction(listingId);

      if (!result.success) {
        setError(result.error ?? "Nu am putut actualiza favoritele.");
        return;
      }

      setFavorited(Boolean(result.favorited));
    });
  }

  return (
    <div className="grid gap-1">
      <Button
        type="button"
        onClick={toggle}
        disabled={isPending}
        variant="outline"
        className="h-12 rounded-full border-border bg-background px-5 font-bold"
      >
        <Heart
          className={favorited ? "size-4 fill-current" : "size-4"}
          aria-hidden="true"
        />
        {isPending ? "Se salvează..." : favorited ? "Salvat" : "Salvează"}
      </Button>
      {error ? <p className="text-xs font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}

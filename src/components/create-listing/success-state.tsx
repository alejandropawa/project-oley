import Link from "next/link";
import { CheckCircle2, Eye, RotateCcw, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SuccessState({
  title = "Anunțul tău este pregătit",
  description = "În versiunea următoare îl vom salva în contul tău. Pentru moment, preview-ul rămâne local în browser.",
  listingHref,
  onPreview,
  onReset,
}: {
  title?: string;
  description?: string;
  listingHref?: string;
  onPreview: () => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-[#D5E4DF] bg-card p-6 text-center shadow-soft sm:p-10">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#E8F1EE] text-primary">
        <CheckCircle2 className="size-8" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-3xl font-black text-foreground">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mx-auto mt-6 grid max-w-lg gap-3 sm:grid-cols-3">
        {listingHref ? (
          <Button
            asChild
            className="h-12 rounded-full bg-primary font-bold text-primary-foreground"
          >
            <Link href={listingHref}>
              <Eye className="size-4" aria-hidden="true" />
              Vezi anunțul
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onPreview}
            variant="outline"
            className="h-12 rounded-full border-border bg-background font-bold"
          >
            <Eye className="size-4" aria-hidden="true" />
            Vezi preview
          </Button>
        )}

        {listingHref ? (
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-full border-border bg-background font-bold"
          >
            <Link href="/cont">
              <UserRound className="size-4" aria-hidden="true" />
              Mergi în cont
            </Link>
          </Button>
        ) : null}

        <Button
          type="button"
          onClick={onReset}
          className="h-12 rounded-full bg-primary font-bold text-primary-foreground"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Publică alt anunț
        </Button>
      </div>
    </div>
  );
}

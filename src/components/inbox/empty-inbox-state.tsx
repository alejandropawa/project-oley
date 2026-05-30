import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyInboxState({
  title = "Nu ai mesaje încă",
  description = "Când discuți despre un anunț, conversațiile vor apărea aici.",
  showCta = true,
}: {
  title?: string;
  description?: string;
  showCta?: boolean;
}) {
  return (
    <section className="rounded-[1.75rem] border border-dashed border-border bg-card p-8 text-center shadow-soft-sm">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-muted text-primary">
        <MessageCircle className="size-7" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {showCta ? (
        <Button
          asChild
          className="mt-6 h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground"
        >
          <Link href="/anunturi">Explorează anunțuri</Link>
        </Button>
      ) : null}
    </section>
  );
}

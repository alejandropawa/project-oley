import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NotificationEmptyState({
  title = "Nu ai notificări încă",
  text = "Aici vei vedea mesajele importante despre anunțuri, conversații și contul tău.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-border bg-card p-8 text-center shadow-soft-sm">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-primary">
        <Bell className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {text}
      </p>
      <Button
        asChild
        className="mt-6 h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground"
      >
        <Link href="/anunturi">Explorează anunțuri</Link>
      </Button>
    </div>
  );
}

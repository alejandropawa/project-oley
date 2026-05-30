import { Search } from "lucide-react";

import { primaryActionButtonClassName } from "@/components/ui/action-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LandingSearch() {
  return (
    <form
      action="/"
      method="get"
      aria-label="Caută anunțuri TROKO"
      className="mx-auto flex w-full max-w-[52rem] items-center gap-2 rounded-full border border-border/90 bg-card/96 p-1.5 shadow-[0_14px_34px_rgba(15,70,61,0.09)] ring-1 ring-white/65 transition-colors duration-200 focus-within:border-brand-border focus-within:shadow-[0_16px_40px_rgba(15,70,61,0.12)] sm:gap-2.5 min-[1800px]:max-w-[var(--landing-search-max)]"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full pl-2 pr-1 sm:gap-3 sm:px-5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand sm:size-9">
          <Search className="size-3.5 sm:size-4" aria-hidden="true" />
        </span>
        <label htmlFor="home-search" className="sr-only">
          Caută anunțuri
        </label>
        <Input
          id="home-search"
          name="q"
          type="search"
          placeholder="Ce cauți astăzi?"
          className="h-10 min-w-0 border-0 bg-transparent p-0 text-sm font-semibold text-brand-ink shadow-none placeholder:text-brand-muted/80 focus-visible:ring-0 sm:h-12 sm:text-base"
        />
      </div>
      <Button
        type="submit"
        className={cn(
          primaryActionButtonClassName,
          "h-10 min-w-[5.1rem] px-4 text-sm font-semibold sm:h-12 sm:min-w-32 sm:px-7",
        )}
      >
        Caută
      </Button>
    </form>
  );
}

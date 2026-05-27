import Link from "next/link";
import type { ReactNode } from "react";

import { buildSearchHref } from "@/lib/search/url";
import type { SearchListingsParams } from "@/lib/search/types";

export function SearchPagination({
  params,
  totalPages,
  path = "/anunturi",
}: {
  params: SearchListingsParams;
  totalPages: number;
  path?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const current = params.page;
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
    const start = Math.max(1, Math.min(current - 2, totalPages - 4));
    return start + index;
  }).filter((page) => page <= totalPages);

  return (
    <nav
      aria-label="Paginare anunțuri"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      <PageLink
        href={buildSearchHref(params, { page: Math.max(1, current - 1) }, path)}
        disabled={current === 1}
      >
        Înapoi
      </PageLink>
      {pages.map((page) => (
        <PageLink
          key={page}
          href={buildSearchHref(params, { page }, path)}
          active={page === current}
        >
          {page}
        </PageLink>
      ))}
      <PageLink
        href={buildSearchHref(
          params,
          { page: Math.min(totalPages, current + 1) },
          path,
        )}
        disabled={current === totalPages}
      >
        Înainte
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active = false,
  disabled = false,
  children,
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span className="rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-muted-foreground opacity-50">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          : "rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
      }
    >
      {children}
    </Link>
  );
}

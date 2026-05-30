import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-xl rounded-[1.75rem] border border-border bg-card p-5 shadow-soft sm:p-7">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase text-primary">Cont TROKO</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {subtitle}
        </p>
      </div>
      {children}
    </section>
  );
}

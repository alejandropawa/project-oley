import { ShieldCheck } from "lucide-react";

export function TrustScoreCard({
  score,
  title = "Scor de incredere",
}: {
  score: number;
  title?: string;
}) {
  const safeScore = Math.max(0, Math.min(score, 100));

  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-primary">{title}</p>
          <p className="mt-2 text-4xl font-black text-foreground">
            {safeScore}
            <span className="text-lg text-muted-foreground">/100</span>
          </p>
        </div>
        <span className="grid size-12 place-items-center rounded-[1rem] bg-[#E8F1EE] text-primary">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${safeScore}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Scorul este orientativ si se bazeaza pe semnale precum profil complet,
        verificari si review-uri. Poate fi actualizat in timp.
      </p>
    </article>
  );
}


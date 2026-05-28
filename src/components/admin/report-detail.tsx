import Link from "next/link";

import {
  ListingModerationButton,
  ModerationNoteForm,
  ReportStatusActionButton,
} from "@/components/admin/admin-action-button";
import { ModerationTimeline } from "@/components/admin/moderation-timeline";
import { ReportStatusBadge } from "@/components/admin/report-status-badge";
import {
  formatAdminDate,
  reportEntityLabels,
  reportReasonLabels,
  shortId,
} from "@/lib/reporting-utils";
import type { ReportDetail as ReportDetailType } from "@/lib/db/reports";
import type { Tables } from "@/types/database";

export function ReportDetail({
  report,
  events,
}: {
  report: ReportDetailType;
  events: Tables<"moderation_events">[];
}) {
  const entityType = report.report.entity_type;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-start">
      <section className="grid gap-5">
        <article className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-primary">
                Raport #{shortId(report.report.id)}
              </p>
              <h2 className="mt-2 text-3xl font-black text-foreground">
                {reportReasonLabels[report.report.reason]}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {reportEntityLabels[entityType]} · raportat de{" "}
                {report.reporterName} ·{" "}
                {formatAdminDate(report.report.created_at)}
              </p>
            </div>
            <ReportStatusBadge status={report.report.status} />
          </div>
          {report.report.description ? (
            <div className="mt-5 rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm font-bold text-foreground">
                Descriere utilizator
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {report.report.description}
              </p>
            </div>
          ) : null}
        </article>

        <article className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-sm">
          <h2 className="text-2xl font-black text-foreground">
            Element raportat
          </h2>
          <div className="mt-4 rounded-[1.25rem] border border-border bg-background p-4">
            <h3 className="text-xl font-black text-foreground">
              {report.target.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {report.target.description}
            </p>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              {report.target.metadata.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-bold uppercase text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-foreground">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
            {report.target.href ? (
              <Link
                href={report.target.href}
                className="mt-4 inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-bold text-foreground"
              >
                Deschide anunțul
              </Link>
            ) : null}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-sm">
          <h2 className="text-2xl font-black text-foreground">
            Timeline moderare
          </h2>
          <div className="mt-4">
            <ModerationTimeline events={events} />
          </div>
        </article>
      </section>

      <aside className="grid gap-4 lg:sticky lg:top-24">
        <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
          <h2 className="text-xl font-black text-foreground">
            Acțiuni raport
          </h2>
          <div className="mt-4 grid gap-2">
            <ReportStatusActionButton reportId={report.report.id} status="in_review">
              Marchează în analiză
            </ReportStatusActionButton>
            <ReportStatusActionButton reportId={report.report.id} status="resolved">
              Rezolvă raportul
            </ReportStatusActionButton>
            <ReportStatusActionButton reportId={report.report.id} status="dismissed">
              Respinge raportul
            </ReportStatusActionButton>
          </div>
        </section>

        {entityType === "listing" && report.target.listingId ? (
          <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
            <h2 className="text-xl font-black text-foreground">
              Acțiuni anunț
            </h2>
            <div className="mt-4 grid gap-2">
              <ListingModerationButton
                listingId={report.target.listingId}
                reportId={report.report.id}
                action="archive"
              >
                Arhivează anunț
              </ListingModerationButton>
              <ListingModerationButton
                listingId={report.target.listingId}
                reportId={report.report.id}
                action="reactivate"
              >
                Reactivează anunț
              </ListingModerationButton>
              <ListingModerationButton
                listingId={report.target.listingId}
                reportId={report.report.id}
                action="expire"
              >
                Marchează ca expirat
              </ListingModerationButton>
            </div>
          </section>
        ) : (
          <section className="rounded-[1.5rem] border border-warm/45 bg-secondary p-5 shadow-soft-sm">
            <h2 className="font-black text-foreground">
              Acțiuni avansate
            </h2>
            <p className="mt-2 text-sm leading-6 text-warm-foreground">
              {entityType === "user"
                ? "Suspendarea conturilor va fi disponibilă într-o etapă viitoare."
                : "Acțiunile avansate pentru conversații vor fi adăugate ulterior."}
            </p>
          </section>
        )}

        <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
          <ModerationNoteForm reportId={report.report.id} />
        </section>
      </aside>
    </div>
  );
}

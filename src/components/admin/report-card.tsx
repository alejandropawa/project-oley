import Link from "next/link";

import { ReportStatusBadge } from "@/components/admin/report-status-badge";
import {
  formatAdminDate,
  reportEntityLabels,
  reportReasonLabels,
  shortId,
} from "@/lib/reporting-utils";
import type { ReportSummary } from "@/lib/db/reports";

export function ReportCard({ report }: { report: ReportSummary }) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-primary">
            #{shortId(report.report.id)} · {reportEntityLabels[report.report.entity_type]}
          </p>
          <h2 className="mt-2 text-xl font-black text-foreground">
            {reportReasonLabels[report.report.reason]}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {report.targetTitle} · {report.targetSubtitle}
          </p>
          <p className="mt-2 text-xs font-semibold text-muted-foreground">
            Raportat de {report.reporterName} ·{" "}
            {formatAdminDate(report.report.created_at)}
          </p>
        </div>
        <ReportStatusBadge status={report.report.status} />
      </div>
      <Link
        href={`/admin/rapoarte/${report.report.id}`}
        className="mt-5 inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground"
      >
        Analizează
      </Link>
    </article>
  );
}

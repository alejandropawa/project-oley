import { reportEntityLabels, reportReasonLabels, reportStatusLabels } from "@/lib/reporting-utils";
import type { ReportFilters } from "@/lib/db/reports";

export function ReportFilters({ filters }: { filters: ReportFilters }) {
  return (
    <form className="grid gap-3 rounded-[1.5rem] border border-border bg-card p-4 shadow-soft-sm sm:grid-cols-4">
      <Field label="Status" name="status" value={filters.status ?? ""}>
        <option value="">Toate</option>
        {Object.entries(reportStatusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Field>
      <Field label="Tip" name="entityType" value={filters.entityType ?? ""}>
        <option value="">Toate</option>
        {Object.entries(reportEntityLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Field>
      <Field label="Motiv" name="reason" value={filters.reason ?? ""}>
        <option value="">Toate</option>
        {Object.entries(reportReasonLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Field>
      <button className="h-12 self-end rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground">
        Filtrează
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  children,
}: {
  label: string;
  name: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-foreground">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value}
        className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {children}
      </select>
    </label>
  );
}

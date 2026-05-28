import { Badge } from "@/components/ui/badge";
import { reportStatusLabels } from "@/lib/reporting-utils";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";

const styles: Record<Enums<"report_status">, string> = {
  open: "bg-secondary text-warm-foreground",
  in_review: "bg-brand-soft text-primary",
  resolved: "bg-muted text-primary",
  dismissed: "bg-background text-muted-foreground",
};

export function ReportStatusBadge({
  status,
}: {
  status: Enums<"report_status">;
}) {
  return (
    <Badge className={cn("rounded-full px-3 py-1 text-xs font-bold", styles[status])}>
      {reportStatusLabels[status]}
    </Badge>
  );
}

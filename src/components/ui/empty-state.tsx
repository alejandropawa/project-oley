import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "rounded-lg border border-dashed border-border bg-card p-8 text-center shadow-soft-sm",
        className
      )}
    >
      {Icon ? (
        <span className="mx-auto grid size-12 place-items-center rounded-md bg-brand-soft text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export { EmptyState }

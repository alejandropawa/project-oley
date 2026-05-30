import * as React from "react"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value = 0,
  max = 100,
  ...props
}: React.ComponentProps<"div"> & {
  value?: number
  max?: number
}) {
  const boundedValue = Math.max(0, Math.min(value, max))
  const percent = max > 0 ? (boundedValue / max) * 100 : 0

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={boundedValue}
      className={cn("h-2 overflow-hidden rounded-full bg-brand-soft", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-200"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export { Progress }

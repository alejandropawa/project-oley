import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

function Stepper({
  steps,
  currentStep,
  className,
}: {
  steps: readonly string[]
  currentStep: number
  className?: string
}) {
  return (
    <ol data-slot="stepper" className={cn("grid gap-3", className)}>
      {steps.map((label, index) => {
        const isDone = index < currentStep
        const isCurrent = index === currentStep

        return (
          <li key={label} className="flex items-center gap-3">
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                isDone && "border-primary bg-white text-primary",
                isCurrent && "border-primary bg-primary text-primary-foreground",
                !isDone && !isCurrent && "border-border bg-white text-muted-foreground"
              )}
            >
              {isDone ? <Check className="size-4" aria-hidden="true" /> : index + 1}
            </span>
            <span
              className={cn(
                "text-sm font-semibold",
                isDone || isCurrent ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export { Stepper }

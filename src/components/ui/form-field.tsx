import * as React from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="form-field"
      data-invalid={error ? true : undefined}
      className={cn("grid gap-2", className)}
    >
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
      {error ? (
        <p className="text-sm font-semibold text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-sm leading-5 text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export { FormField }

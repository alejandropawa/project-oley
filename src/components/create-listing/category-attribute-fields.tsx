import type { ReactNode } from "react";

import {
  getFallbackAttributeDefinitions,
  stringifyAttribute,
  type ListingAttributes,
} from "@/lib/categories/attribute-definitions";

export function CategoryAttributeFields({
  categorySlug,
  values,
  onChange,
}: {
  categorySlug: string;
  values: ListingAttributes;
  onChange: (key: string, value: ListingAttributes[string]) => void;
}) {
  const definitions = getFallbackAttributeDefinitions(categorySlug);

  if (!categorySlug || definitions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[1.15rem] border border-border bg-background/70 p-4 shadow-sm">
      <div>
        <h3 className="text-base font-black text-foreground">
          Detalii specifice categoriei
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Aceste detalii ajută cumpărătorii să găsească mai ușor anunțul.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {definitions.map((definition) => {
          const fieldId = `attribute-${definition.key}`;
          const value = values[definition.key];

          if (definition.type === "boolean") {
            return (
              <label
                key={definition.key}
                className="flex min-h-12 items-start gap-3 rounded-[1rem] border border-border bg-card p-3"
              >
                <input
                  id={fieldId}
                  type="checkbox"
                  checked={value === true}
                  onChange={(event) =>
                    onChange(definition.key, event.target.checked)
                  }
                  className="mt-1 size-4 accent-brand"
                />
                <span>
                  <span className="block text-sm font-bold text-foreground">
                    {definition.label}
                    {definition.isRequired ? (
                      <span className="text-destructive"> *</span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Marchează dacă se aplică.
                  </span>
                </span>
              </label>
            );
          }

          if (definition.type === "select") {
            return (
              <Field
                key={definition.key}
                label={formatLabel(definition.label, definition.unit)}
                required={definition.isRequired}
              >
                <select
                  id={fieldId}
                  value={stringifyAttribute(value)}
                  onChange={(event) =>
                    onChange(definition.key, event.target.value)
                  }
                  className={controlClassName}
                >
                  <option value="">Alege</option>
                  {definition.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            );
          }

          return (
            <Field
              key={definition.key}
              label={formatLabel(definition.label, definition.unit)}
              required={definition.isRequired}
            >
              <input
                id={fieldId}
                type={definition.type === "number" ? "number" : "text"}
                inputMode={definition.type === "number" ? "numeric" : undefined}
                value={stringifyAttribute(value)}
                onChange={(event) =>
                  onChange(
                    definition.key,
                    definition.type === "number" && event.target.value
                      ? Number(event.target.value)
                      : event.target.value,
                  )
                }
                placeholder={definition.label}
                className={controlClassName}
              />
            </Field>
          );
        })}
      </div>
    </section>
  );
}

const controlClassName =
  "h-11 w-full rounded-[0.7rem] border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function formatLabel(label: string, unit?: string) {
  return unit ? `${label} (${unit})` : label;
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

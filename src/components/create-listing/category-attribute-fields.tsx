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
    <section className="rounded-[1.5rem] border border-border bg-background p-4">
      <div>
        <h3 className="text-lg font-black text-foreground">
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
                  className="mt-1 size-4 accent-[#2F6F65]"
                />
                <span>
                  <span className="block text-sm font-bold text-foreground">
                    {definition.label}
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
              >
                <select
                  id={fieldId}
                  value={stringifyAttribute(value)}
                  onChange={(event) =>
                    onChange(definition.key, event.target.value)
                  }
                  className="h-12 w-full rounded-[1rem] border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
                className="h-12 w-full rounded-[1rem] border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </Field>
          );
        })}
      </div>
    </section>
  );
}

function formatLabel(label: string, unit?: string) {
  return unit ? `${label} (${unit})` : label;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

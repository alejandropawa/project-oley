import { Camera, MessageCircle, Phone, Trash2, Upload } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { LocationPrecisionField } from "@/components/location/location-precision-field";
import { UseBrowserLocationButton } from "@/components/location/use-browser-location-button";
import { romanianLocations } from "@/lib/romanian-locations";
import { cn } from "@/lib/utils";
import type {
  ContactPreference,
  CreateListingErrors,
  CreateListingValues,
} from "@/lib/create-listing-validation";

const contactOptions: Array<{
  value: ContactPreference;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    value: "chat",
    title: "Chat TROKO",
    description: "Recomandat pentru conversații sigure în aplicație.",
    icon: MessageCircle,
  },
  {
    value: "phone",
    title: "Telefon",
    description: "Potrivit dacă vrei răspunsuri rapide prin apel.",
    icon: Phone,
  },
  {
    value: "chat-phone",
    title: "Chat + telefon",
    description: "Lasă cumpărătorul să aleagă metoda potrivită.",
    icon: Camera,
  },
];

export function ListingMediaLocationStep({
  values,
  errors,
  onFieldChange,
  onLocationChange,
  onFilesSelected,
  onRemovePhoto,
}: {
  values: CreateListingValues;
  errors: CreateListingErrors;
  onFieldChange: <K extends keyof CreateListingValues>(
    key: K,
    value: CreateListingValues[K],
  ) => void;
  onLocationChange: (city: string) => void;
  onFilesSelected: (files: FileList | null) => void;
  onRemovePhoto: (id: string) => void;
}) {
  const remainingPhotos = 8 - values.photos.length;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-black text-foreground">
          Fotografii & locație
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Adaugă imagini clare și o locație realistă. Fotografiile se încarcă
          doar când publici anunțul.
        </p>
      </div>

      <div className="grid gap-5">
        <section className="rounded-[1.5rem] border border-border bg-background p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-black text-foreground">Fotografii</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Adaugă până la 8 fotografii. Primele imagini clare cresc
                șansele de răspuns.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-primary">
              {values.photos.length}/8
            </span>
          </div>

          <label
            className={cn(
              "mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-border bg-card p-5 text-center transition hover:border-primary/50",
              remainingPhotos === 0 && "cursor-not-allowed opacity-60",
            )}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={remainingPhotos === 0}
              onChange={(event) => {
                onFilesSelected(event.target.files);
                event.target.value = "";
              }}
              className="sr-only"
            />
            <span className="grid size-12 place-items-center rounded-full bg-muted text-primary">
              <Upload className="size-5" aria-hidden="true" />
            </span>
            <span className="mt-3 text-sm font-black text-foreground">
              Alege imagini din dispozitiv
            </span>
            <span className="mt-1 text-xs leading-5 text-muted-foreground">
              {remainingPhotos > 0
                ? `Mai poți adăuga ${remainingPhotos} fotografii.`
                : "Ai atins limita de fotografii."}
            </span>
          </label>

          {values.photos.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {values.photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square overflow-hidden rounded-[1rem] border border-border bg-muted"
                  style={{
                    backgroundImage: `url(${photo.url})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                >
                  <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-xs font-bold text-foreground backdrop-blur">
                    {index === 0 ? "Copertă" : index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(photo.id)}
                    className="absolute bottom-2 right-2 grid size-9 place-items-center rounded-full bg-card/90 text-foreground shadow-soft-sm backdrop-blur transition hover:bg-destructive hover:text-white"
                    aria-label={`Elimină fotografia ${photo.name}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Oraș" error={errors.city}>
            <select
              value={values.city}
              onChange={(event) => onLocationChange(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Alege orașul</option>
              {romanianLocations.map((location) => (
                <option key={location.city} value={location.city}>
                  {location.city}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Județ" error={errors.county}>
            <input
              value={values.county}
              onChange={(event) => onFieldChange("county", event.target.value)}
              placeholder="Se completează automat"
              className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </Field>
        </div>

        <section className="rounded-[1.5rem] border border-border bg-background p-4">
          <div className="mb-4">
            <h3 className="font-black text-foreground">Locație</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Pentru siguranță, TROKO afișează public doar o locație
              aproximativă.
            </p>
          </div>

          <LocationPrecisionField
            value={values.locationPrecision}
            onChange={(value) => onFieldChange("locationPrecision", value)}
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field label="Zonă sau reper public">
              <input
                value={values.locationLabel}
                onChange={(event) =>
                  onFieldChange("locationLabel", event.target.value)
                }
                placeholder="ex. Zona Unirii, aproape de centru"
                className="h-12 w-full rounded-[1rem] border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <span className="mt-1.5 block text-xs leading-5 text-muted-foreground">
                Nu adăuga strada sau adresa exactă.
              </span>
            </Field>
            <UseBrowserLocationButton
              onDetected={(coords) => {
                onFieldChange("latitude", coords.latitude);
                onFieldChange("longitude", coords.longitude);
                if (values.locationPrecision === "city") {
                  onFieldChange("locationPrecision", "approximate");
                }
              }}
            />
          </div>
        </section>

        <section>
          <h3 className="font-black text-foreground">Preferință contact</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {contactOptions.map((option) => {
              const Icon = option.icon;
              const selected = values.contactPreference === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    onFieldChange("contactPreference", option.value)
                  }
                  className={cn(
                    "rounded-[1.25rem] border p-4 text-left transition hover:border-primary/50",
                    selected
                      ? "border-primary bg-[#E8F1EE]"
                      : "border-border bg-background",
                  )}
                >
                  <span className="grid size-10 place-items-center rounded-[0.9rem] bg-card text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="mt-3 block text-sm font-black text-foreground">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-foreground">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-sm font-semibold text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}

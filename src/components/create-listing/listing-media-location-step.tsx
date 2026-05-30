import { ImagePlus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CreateListingValues } from "@/lib/create-listing-validation";

export function ListingMediaLocationStep({
  values,
  onFilesSelected,
  onRemovePhoto,
}: {
  values: CreateListingValues;
  onFilesSelected: (files: FileList | null) => void;
  onRemovePhoto: (id: string) => void;
}) {
  const remainingPhotos = 8 - values.photos.length;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-foreground">
          3. Adaugă fotografii
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Adaugă imagini clare și relevante pentru anunțul tău.
        </p>
      </div>

      <div className="grid gap-5">
        <section
          className={cn(
            "flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-brand-surface p-6 text-center transition",
            remainingPhotos > 0 && "hover:border-primary/50",
            remainingPhotos === 0 && "opacity-70",
          )}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (remainingPhotos > 0) {
              onFilesSelected(event.dataTransfer.files);
            }
          }}
        >
          <label className="flex cursor-pointer flex-col items-center">
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
            <span className="grid size-16 place-items-center rounded-full bg-brand-soft text-primary">
              <ImagePlus className="size-8" aria-hidden="true" />
            </span>
            <span className="mt-4 text-base font-semibold text-foreground">
              Trage și plasează imaginile aici
            </span>
            <span className="mt-2 text-sm font-semibold text-muted-foreground">
              sau
            </span>
            <span className="mt-4 inline-flex h-12 min-w-40 items-center justify-center rounded-sm border border-input bg-card px-5 text-sm font-semibold text-foreground shadow-soft-sm transition hover:bg-muted">
              Alege fișiere
            </span>
            <span className="mt-3 text-xs leading-5 text-muted-foreground">
              {remainingPhotos > 0
                ? `Mai poți adăuga ${remainingPhotos} fotografii.`
                : "Ai atins limita de 8 fotografii."}
            </span>
          </label>
        </section>

        {values.photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {values.photos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
                style={{
                  backgroundImage: `url(${photo.url})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              >
                <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-xs font-semibold text-foreground backdrop-blur">
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

        <section className="text-sm leading-7 text-muted-foreground">
          <h3 className="font-semibold text-foreground">Recomandări:</h3>
          <ul className="mt-2 list-disc pl-5">
            <li>Folosește imagini clare și luminoase</li>
            <li>Include mai multe unghiuri</li>
            <li>Dimensiune recomandată: minim 1200x800px</li>
            <li>Poți adăuga până la 8 imagini</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";

import { updateListingAttributesAction } from "@/app/actions/listings";
import { CategoryAttributeFields } from "@/components/create-listing/category-attribute-fields";
import { LocationPrecisionField } from "@/components/location/location-precision-field";
import { UseBrowserLocationButton } from "@/components/location/use-browser-location-button";
import { Button } from "@/components/ui/button";
import { romanianCities } from "@/lib/romanian-cities";
import type { Listing } from "@/lib/mock-data";
import type { ListingAttributes } from "@/lib/categories/attribute-definitions";
import type { ListingLocationPrecision } from "@/lib/locations/types";

export function EditListingAttributesForm({ listing }: { listing: Listing }) {
  const [attributes, setAttributes] = useState<ListingAttributes>(
    listing.attributes ?? {},
  );
  const [city, setCity] = useState(listing.city);
  const [county, setCounty] = useState(listing.county);
  const [latitude, setLatitude] = useState<number | null>(
    listing.publicLatitude ?? null,
  );
  const [longitude, setLongitude] = useState<number | null>(
    listing.publicLongitude ?? null,
  );
  const [locationPrecision, setLocationPrecision] =
    useState<ListingLocationPrecision>(listing.locationPrecision ?? "city");
  const [locationLabel, setLocationLabel] = useState(listing.locationLabel ?? "");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateAttribute(key: string, value: ListingAttributes[string]) {
    setAttributes((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function save() {
    startTransition(async () => {
      const result = await updateListingAttributesAction(listing.id, {
        attributes,
        city,
        county,
        latitude,
        longitude,
        locationPrecision,
        locationLabel,
      });
      setMessage(
        result.success
          ? "Detaliile anunțului au fost salvate."
          : result.error ?? "Nu am putut salva detaliile.",
      );
    });
  }

  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-sm">
      <CategoryAttributeFields
        categorySlug={listing.categorySlug}
        values={attributes}
        onChange={updateAttribute}
      />

      <section className="mt-5 rounded-[1.5rem] border border-border bg-background p-4">
        <h3 className="text-lg font-black text-foreground">Locație</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          TROKO afișează public doar o locație aproximativă.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-sm font-bold text-foreground">
              Oraș
            </span>
            <select
              value={city}
              onChange={(event) => {
                const nextCity = romanianCities.find(
                  (item) => item.name === event.target.value,
                );
                setCity(event.target.value);
                setCounty(nextCity?.county ?? county);
                setLatitude(null);
                setLongitude(null);
              }}
              className="h-12 w-full rounded-[1rem] border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {romanianCities.map((item) => (
                <option key={item.slug} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-bold text-foreground">
              Județ
            </span>
            <input
              value={county}
              onChange={(event) => setCounty(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
        </div>

        <div className="mt-4">
          <LocationPrecisionField
            value={locationPrecision}
            onChange={setLocationPrecision}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label>
            <span className="mb-1.5 block text-sm font-bold text-foreground">
              Zonă sau reper public
            </span>
            <input
              value={locationLabel}
              onChange={(event) => setLocationLabel(event.target.value)}
              placeholder="ex. Zona Unirii"
              className="h-12 w-full rounded-[1rem] border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <UseBrowserLocationButton
            onDetected={(coords) => {
              setLatitude(coords.latitude);
              setLongitude(coords.longitude);
              if (locationPrecision === "city") {
                setLocationPrecision("approximate");
              }
            }}
          />
        </div>
      </section>

      {message ? (
        <p className="mt-4 rounded-[1rem] border border-border bg-background p-3 text-sm font-semibold text-muted-foreground">
          {message}
        </p>
      ) : null}

      <Button
        type="button"
        onClick={save}
        disabled={isPending}
        className="mt-5 h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground"
      >
        {isPending ? "Se salvează..." : "Salvează detaliile"}
      </Button>
    </div>
  );
}

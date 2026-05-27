"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  LogIn,
} from "lucide-react";

import { CreateListingProgress } from "@/components/create-listing/create-listing-progress";
import { ListingDetailsStep } from "@/components/create-listing/listing-details-step";
import { ListingMediaLocationStep } from "@/components/create-listing/listing-media-location-step";
import { ListingPreviewStep } from "@/components/create-listing/listing-preview-step";
import { ListingTypeStep } from "@/components/create-listing/listing-type-step";
import { SuccessState } from "@/components/create-listing/success-state";
import { Button } from "@/components/ui/button";
import {
  hasValidationErrors,
  initialCreateListingValues,
  validateAll,
  validateCreateListingStep,
} from "@/lib/create-listing-validation";
import { createListing } from "@/lib/db/listings";
import { MAX_LISTING_IMAGE_SIZE } from "@/lib/db/storage";
import { categories } from "@/lib/mock-data";
import { romanianLocations } from "@/lib/romanian-locations";
import { createClient } from "@/lib/supabase/browser";
import type {
  CreateListingErrors,
  CreateListingStep,
  CreateListingValues,
  PhotoPreview,
} from "@/lib/create-listing-validation";
import type { ListingType } from "@/lib/mock-data";

export function CreateListingFlow({
  isAuthenticated = false,
  isSupabaseReady = false,
}: {
  isAuthenticated?: boolean;
  isSupabaseReady?: boolean;
}) {
  const [step, setStep] = useState<CreateListingStep>(0);
  const [values, setValues] = useState<CreateListingValues>(
    initialCreateListingValues,
  );
  const [errors, setErrors] = useState<CreateListingErrors>({});
  const [successSlug, setSuccessSlug] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  function updateField<K extends keyof CreateListingValues>(
    key: K,
    value: CreateListingValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setPublishError("");
  }

  function updateType(type: ListingType) {
    setValues((current) => ({
      ...current,
      type,
      price: type === "swap" ? "" : current.price,
    }));
    setErrors((current) => ({ ...current, type: undefined, price: undefined }));
    setPublishError("");
  }

  function updateCategory(categorySlug: string) {
    const selectedCategory = categories.find(
      (category) => category.slug === categorySlug,
    );

    setValues((current) => ({
      ...current,
      categorySlug,
      subcategory: selectedCategory?.subcategories[0] ?? "",
      attributes: {},
    }));
    setErrors((current) => ({ ...current, categorySlug: undefined, attributes: undefined }));
    setPublishError("");
  }

  function updateAttribute(
    key: string,
    value: CreateListingValues["attributes"][string],
  ) {
    setValues((current) => ({
      ...current,
      attributes: {
        ...current.attributes,
        [key]: value,
      },
    }));
    setErrors((current) => ({ ...current, attributes: undefined }));
    setPublishError("");
  }

  function updateLocation(city: string) {
    const location = romanianLocations.find((item) => item.city === city);

    setValues((current) => ({
      ...current,
      city,
      county: location?.county ?? "",
    }));
    setErrors((current) => ({
      ...current,
      city: undefined,
      county: undefined,
    }));
    setPublishError("");
  }

  function handleFilesSelected(files: FileList | null) {
    if (!files) {
      return;
    }

    const remaining = 8 - values.photos.length;
    if (remaining <= 0) {
      setMediaError("Poți adăuga maximum 8 fotografii.");
      return;
    }

    setMediaError("");
    const selectedFiles = Array.from(files);
    const validFiles = selectedFiles.filter(
      (file) =>
        file.type.startsWith("image/") && file.size <= MAX_LISTING_IMAGE_SIZE,
    );

    if (validFiles.length < selectedFiles.length) {
      setMediaError(
        "Am ignorat fișierele care nu sunt imagini sau depășesc 8MB.",
      );
    }

    const newPhotos: PhotoPreview[] = validFiles
      .slice(0, remaining)
      .map((file) => {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.add(url);

        return {
          id: createPhotoId(),
          name: file.name,
          url,
          file,
          size: file.size,
          type: file.type,
        };
      });

    if (newPhotos.length > 0) {
      setValues((current) => ({
        ...current,
        photos: [...current.photos, ...newPhotos],
      }));
    }
  }

  function removePhoto(id: string) {
    setValues((current) => {
      const photo = current.photos.find((item) => item.id === id);

      if (photo) {
        URL.revokeObjectURL(photo.url);
        objectUrlsRef.current.delete(photo.url);
      }

      return {
        ...current,
        photos: current.photos.filter((item) => item.id !== id),
      };
    });
  }

  function goNext() {
    const stepErrors = validateCreateListingStep(step, values);

    if (hasValidationErrors(stepErrors)) {
      setErrors(stepErrors);
      return;
    }

    if (step < 3) {
      setStep((current) => (current + 1) as CreateListingStep);
      setErrors({});
      setPublishError("");
    }
  }

  function goBack() {
    if (step > 0) {
      setStep((current) => (current - 1) as CreateListingStep);
      setErrors({});
      setPublishError("");
    }
  }

  async function publishListing() {
    const allErrors = validateAll(values);

    if (hasValidationErrors(allErrors)) {
      setErrors(allErrors);
      setStep(getFirstInvalidStep(allErrors));
      return;
    }

    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (!isSupabaseReady) {
      setPublishError("Publicarea reală are nevoie de configurarea Supabase.");
      setLocalSuccess(true);
      return;
    }

    const supabase = createClient();

    if (!supabase) {
      setPublishError("Publicarea reală are nevoie de configurarea Supabase.");
      setLocalSuccess(true);
      return;
    }

    setIsPublishing(true);
    setPublishError("");

    const result = await createListing(values, supabase);

    setIsPublishing(false);

    if (result.error === "UPLOAD_IMAGES_FAILED") {
      setPublishError("Nu am putut încărca imaginile.");
      return;
    }

    if (result.error || !result.listing) {
      setPublishError("Nu am putut publica anunțul. Încearcă din nou.");
      return;
    }

    setSuccessSlug(result.listing.slug);
  }

  function resetFlow() {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
    setValues(initialCreateListingValues);
    setErrors({});
    setSuccessSlug(null);
    setLocalSuccess(false);
    setShowAuthPrompt(false);
    setPublishError("");
    setMediaError("");
    setStep(0);
  }

  if (successSlug) {
    return (
      <SuccessState
        title="Anunțul a fost publicat"
        description="Anunțul tău este salvat în TROKO și poate fi deschis din pagina lui publică sau din cont."
        listingHref={`/anunturi/${successSlug}`}
        onPreview={() => {
          setSuccessSlug(null);
          setStep(3);
        }}
        onReset={resetFlow}
      />
    );
  }

  if (localSuccess) {
    return (
      <SuccessState
        description="Publicarea reală are nevoie de configurarea Supabase. Pentru moment, preview-ul rămâne local în browser."
        onPreview={() => {
          setLocalSuccess(false);
          setStep(3);
        }}
        onReset={resetFlow}
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
      <div className="lg:sticky lg:top-24">
        <CreateListingProgress step={step} />
      </div>

      <section className="rounded-[1.75rem] border border-border bg-card p-4 shadow-soft sm:p-6">
        {step === 0 ? (
          <ListingTypeStep
            values={values}
            errors={errors}
            onChange={updateType}
          />
        ) : null}
        {step === 1 ? (
          <ListingDetailsStep
            values={values}
            errors={errors}
            onFieldChange={updateField}
            onCategoryChange={updateCategory}
            onAttributeChange={updateAttribute}
          />
        ) : null}
        {step === 2 ? (
          <>
            <ListingMediaLocationStep
              values={values}
              errors={errors}
              onFieldChange={updateField}
              onLocationChange={updateLocation}
              onFilesSelected={handleFilesSelected}
              onRemovePhoto={removePhoto}
            />
            {mediaError ? (
              <p className="mt-4 rounded-[1rem] border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                {mediaError}
              </p>
            ) : null}
          </>
        ) : null}
        {step === 3 ? <ListingPreviewStep values={values} /> : null}

        {showAuthPrompt ? (
          <div className="mt-6 rounded-[1.5rem] border border-[#D5E4DF] bg-[#E8F1EE] p-5 shadow-soft-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-foreground">
                  Intră în cont pentru a publica anunțul
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Anunțul rămâne în editor. Autentificarea va permite salvarea
                  și publicarea lui în contul tău.
                </p>
              </div>
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-card text-primary">
                <LogIn className="size-5" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <Button
                asChild
                className="h-11 rounded-full bg-primary font-bold text-primary-foreground"
              >
                <Link href="/login?redirectTo=/publica">Intră în cont</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-border bg-card font-bold"
              >
                <Link href="/inregistrare">Creează cont</Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAuthPrompt(false)}
                className="h-11 rounded-full font-bold text-muted-foreground"
              >
                Continuă editarea
              </Button>
            </div>
          </div>
        ) : null}

        {publishError ? (
          <p className="mt-5 rounded-[1rem] border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
            {publishError}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            disabled={step === 0 || isPublishing}
            className="h-12 rounded-full px-5 font-bold text-muted-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Înapoi
          </Button>

          {step === 3 ? (
            <Button
              type="button"
              onClick={publishListing}
              disabled={isPublishing}
              className="h-12 rounded-full bg-primary px-6 font-bold text-primary-foreground"
            >
              {isPublishing ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="size-4" aria-hidden="true" />
              )}
              {isPublishing ? "Se publică anunțul..." : "Publică anunț"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={goNext}
              disabled={isPublishing}
              className="h-12 rounded-full bg-primary px-6 font-bold text-primary-foreground"
            >
              Continuă
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

function getFirstInvalidStep(errors: CreateListingErrors): CreateListingStep {
  if (errors.type) {
    return 0;
  }

  if (
    errors.title ||
    errors.categorySlug ||
    errors.attributes ||
    errors.description ||
    errors.price
  ) {
    return 1;
  }

  return 2;
}

function createPhotoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

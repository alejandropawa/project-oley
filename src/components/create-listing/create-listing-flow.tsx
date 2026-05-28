"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Loader2,
  LogIn,
  Send,
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
import { cn } from "@/lib/utils";
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
  surface = "page",
}: {
  isAuthenticated?: boolean;
  isSupabaseReady?: boolean;
  surface?: "page" | "dialog";
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
  const contentRef = useRef<HTMLDivElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const isDialogSurface = surface === "dialog";

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [step]);

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
      type:
        current.type &&
        selectedCategory?.allowedListingTypes.includes(current.type)
          ? current.type
          : selectedCategory?.allowedListingTypes[0] ?? "sell",
      categorySlug,
      subcategory: selectedCategory?.subcategories[0] ?? "",
      attributes: {},
    }));
    setErrors((current) => ({
      ...current,
      type: undefined,
      categorySlug: undefined,
      subcategory: undefined,
      attributes: undefined,
    }));
    setPublishError("");
  }

  function updateSubcategory(subcategory: string) {
    setValues((current) => {
      const attributes = { ...current.attributes };
      delete attributes.subcategory_detail;

      return {
        ...current,
        subcategory,
        attributes,
      };
    });
    setErrors((current) => ({ ...current, subcategory: undefined }));
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

  function updateLocation(locationValue: string) {
    const [city, county] = locationValue.split("|");
    const location = romanianLocations.find(
      (item) =>
        item.city === city && (!county || item.county === county),
    );

    setValues((current) => ({
      ...current,
      city: location?.city ?? city ?? "",
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
    <div
      className={cn(
        "w-full overflow-hidden bg-card",
        isDialogSurface
          ? "flex h-full flex-col rounded-[0.95rem] border border-brand-border/80 shadow-[0_12px_38px_rgba(2,24,20,0.08)]"
          : "rounded-[1.15rem] border border-white/80 shadow-[0_28px_90px_rgba(2,24,20,0.12)]",
      )}
    >
      {!isDialogSurface ? (
        <header className="border-b border-border bg-card/96 px-5 py-4 backdrop-blur sm:px-7">
          <h1 className="text-base font-black text-foreground">
            Creează un anunț nou
          </h1>
        </header>
      ) : null}

      {!isAuthenticated ? (
        <div className="border-b border-brand-border bg-brand-soft/70 px-5 py-4 sm:px-7">
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-primary shadow-sm">
              <LogIn className="size-4" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold leading-6 text-muted-foreground">
              <span className="font-black text-foreground">
                Poți pregăti anunțul acum.
              </span>{" "}
              Pentru publicare finală, va trebui să intri în cont.
            </p>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "grid",
          isDialogSurface
            ? "min-h-0 flex-1 lg:grid-cols-[16rem_1fr]"
            : "lg:h-[calc(100dvh-15rem)] lg:min-h-[34rem] lg:max-h-[42rem] lg:grid-cols-[17rem_1fr]",
        )}
      >
        <div className="border-b border-border bg-background/55 lg:min-h-0 lg:border-b-0 lg:border-r">
          <CreateListingProgress step={step} />
        </div>

        <section className="flex min-h-0 flex-col bg-card">
          <div
            ref={contentRef}
            className={cn(
              "flex-1 overflow-y-auto p-5 sm:p-7",
              isDialogSurface ? "lg:p-7" : "lg:p-8",
            )}
          >
            {step === 0 ? (
              <ListingTypeStep
                values={values}
                errors={errors}
                onCategoryChange={updateCategory}
              />
            ) : null}
            {step === 1 ? (
              <ListingDetailsStep
                values={values}
                errors={errors}
                onFieldChange={updateField}
                onTypeChange={updateType}
                onCategoryChange={updateCategory}
                onSubcategoryChange={updateSubcategory}
                onAttributeChange={updateAttribute}
                onLocationChange={updateLocation}
              />
            ) : null}
            {step === 2 ? (
              <>
                <ListingMediaLocationStep
                  values={values}
                  onFilesSelected={handleFilesSelected}
                  onRemovePhoto={removePhoto}
                />
                {mediaError ? (
                  <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                    {mediaError}
                  </p>
                ) : null}
              </>
            ) : null}
            {step === 3 ? <ListingPreviewStep values={values} /> : null}

            {showAuthPrompt ? (
              <div className="mt-6 rounded-[0.9rem] border border-brand-border bg-brand-soft p-5 shadow-soft-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-black text-foreground">
                      Intră în cont pentru a publica anunțul
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Anunțul rămâne în editor. Autentificarea va permite
                      salvarea și publicarea lui în contul tău.
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
                    <Link href="/?auth=login&redirectTo=/publica">
                      Intră în cont
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-border bg-card font-bold"
                  >
                    <Link href="/?auth=register&redirectTo=/publica">
                      Creează cont
                    </Link>
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
              <p className="mt-5 rounded-[0.9rem] border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                {publishError}
              </p>
            ) : null}
          </div>

          <footer className="border-t border-border bg-card px-5 py-4 sm:px-7">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {step === 0 ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-full border-border bg-card px-6 font-bold"
                >
                  <Link href="/">Anulează</Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={isPublishing}
                  className="h-11 rounded-full border-border bg-card px-6 font-bold text-foreground"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Înapoi
                </Button>
              )}

              {step === 3 ? (
                <div className="flex flex-col items-stretch gap-2 sm:min-w-80 sm:items-end">
                  <Button
                    type="button"
                    onClick={publishListing}
                    disabled={isPublishing}
                    className="h-11 rounded-full bg-primary px-8 font-bold text-primary-foreground"
                  >
                    {isPublishing ? (
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Send className="size-4" aria-hidden="true" />
                    )}
                    {isPublishing ? "Se publică anunțul..." : "Publică anunțul"}
                  </Button>
                  <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground sm:justify-end">
                    <LockKeyhole className="size-3" aria-hidden="true" />
                    Anunțul va fi publicat după verificare.
                  </p>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={goNext}
                  disabled={isPublishing}
                  className="h-11 rounded-full bg-primary px-8 font-bold text-primary-foreground"
                >
                  Continuă
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}

function getFirstInvalidStep(errors: CreateListingErrors): CreateListingStep {
  if (errors.categorySlug) {
    return 0;
  }

  if (
    errors.title ||
    errors.type ||
    errors.categorySlug ||
    errors.subcategory ||
    errors.attributes ||
    errors.description ||
    errors.price ||
    errors.city ||
    errors.county
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

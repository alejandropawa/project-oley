"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { createPromotionOrderAction } from "@/app/actions/promotions";
import { PromotionPackageCard } from "@/components/promotions/promotion-package-card";
import { Button } from "@/components/ui/button";
import type { PromotionPackageConfig } from "@/lib/promotions/pricing";

export function PromoteListingForm({
  listingId,
  packages,
  disabledReason,
}: {
  listingId: string;
  packages: PromotionPackageConfig[];
  disabledReason?: string;
}) {
  const [selectedPackageId, setSelectedPackageId] = useState(packages[2]?.id ?? packages[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    setMessage("");
    setError("");

    if (disabledReason) {
      setError(disabledReason);
      return;
    }

    if (!selectedPackageId) {
      setError("Alege un pachet de promovare.");
      return;
    }

    startTransition(async () => {
      const result = await createPromotionOrderAction({
        listingId,
        packageId: selectedPackageId,
        note,
      });

      if (!result.success) {
        setError(result.error ?? "Nu am putut trimite solicitarea.");
        return;
      }

      setMessage("Solicitarea de promovare a fost trimisă.");
      setNote("");
    });
  }

  if (message) {
    return (
      <div className="rounded-[1.75rem] border border-brand-border bg-brand-soft p-6 shadow-soft-sm">
        <h2 className="text-2xl font-semibold text-foreground">
          Solicitarea de promovare a fost trimisă.
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          În această versiune, echipa TROKO o poate activa manual din panoul
          admin. Plățile online vor fi disponibile în curând.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            asChild
            className="h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground"
          >
            <Link href="/cont/promovari">Vezi solicitările mele</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-border bg-background px-5 font-semibold"
          >
            <Link href="/cont/anunturi">Înapoi la anunțuri</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {packages.map((promotionPackage) => (
          <PromotionPackageCard
            key={promotionPackage.id}
            promotionPackage={promotionPackage}
            selected={selectedPackageId === promotionPackage.id}
            recommended={promotionPackage.code === "featured_7d"}
            onSelect={setSelectedPackageId}
          />
        ))}
      </div>

      <label className="block rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
        <span className="text-sm font-semibold text-foreground">
          Notă pentru echipa TROKO
        </span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          maxLength={1200}
          placeholder="Opțional: spune-ne dacă vrei să promovăm anunțul într-un interval anume."
          className="mt-3 min-h-28 w-full resize-y rounded-[1rem] border border-input bg-background px-3 py-3 text-base leading-6 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      <div className="rounded-[1.5rem] border border-warm/45 bg-secondary p-4 text-sm font-semibold leading-6 text-warm-foreground">
        Plățile online vor fi disponibile în curând. Momentan, poți trimite o
        solicitare de promovare, iar echipa TROKO o poate activa manual.
      </div>

      {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          asChild
          variant="outline"
          className="h-11 rounded-full border-border bg-card px-5 font-semibold"
        >
          <Link href="/cont/anunturi">Înapoi</Link>
        </Button>
        <Button
          type="button"
          onClick={submit}
          disabled={isPending || Boolean(disabledReason)}
          className="h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground"
        >
          {isPending ? "Se trimite..." : "Trimite solicitarea de promovare"}
        </Button>
      </div>
    </div>
  );
}

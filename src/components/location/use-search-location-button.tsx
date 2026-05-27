"use client";

import { useState } from "react";
import { LocateFixed } from "lucide-react";

import { Button } from "@/components/ui/button";

export function UseSearchLocationButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  function detectLocation() {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const url = new URL(window.location.href);
        url.searchParams.set("lat", round(position.coords.latitude));
        url.searchParams.set("lng", round(position.coords.longitude));
        url.searchParams.set("aproape", "1");
        url.searchParams.set("sort", "distance");

        if (!url.searchParams.get("raza")) {
          url.searchParams.set("raza", "25");
        }

        window.location.href = url.toString();
      },
      () => setStatus("error"),
      {
        enableHighAccuracy: false,
        maximumAge: 60_000,
        timeout: 10_000,
      },
    );
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={detectLocation}
        disabled={status === "loading"}
        className="h-11 w-full rounded-full border-border bg-background px-4 font-bold"
      >
        <LocateFixed className="size-4" aria-hidden="true" />
        {status === "loading" ? "Se detectează locația..." : "Folosește locația mea"}
      </Button>
      {status === "error" ? (
        <p className="mt-2 text-xs font-semibold text-destructive">
          Nu am putut accesa locația. Alege orașul manual.
        </p>
      ) : null}
    </div>
  );
}

function round(value: number) {
  return String(Math.round(value * 1_000_000) / 1_000_000);
}

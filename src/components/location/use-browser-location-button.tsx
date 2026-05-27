"use client";

import { useState } from "react";
import { LocateFixed } from "lucide-react";

import { Button } from "@/components/ui/button";

export function UseBrowserLocationButton({
  onDetected,
}: {
  onDetected: (coords: { latitude: number; longitude: number }) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  function detectLocation() {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onDetected({
          latitude: round(position.coords.latitude),
          longitude: round(position.coords.longitude),
        });
        setStatus("success");
      },
      () => {
        setStatus("error");
      },
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
        className="h-11 rounded-full border-border bg-card px-4 font-bold"
      >
        <LocateFixed className="size-4" aria-hidden="true" />
        {status === "loading" ? "Se detectează locația..." : "Folosește locația mea"}
      </Button>
      {status === "success" ? (
        <p className="mt-2 text-xs font-semibold text-primary">
          Locația a fost detectată.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="mt-2 text-xs font-semibold text-destructive">
          Nu am putut accesa locația. Alege orașul manual.
        </p>
      ) : null}
    </div>
  );
}

function round(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

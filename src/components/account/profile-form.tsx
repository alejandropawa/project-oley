"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateCurrentProfile } from "@/lib/db/profiles";
import {
  mapDbContactPreferenceToUi,
  mapUiContactPreferenceToDb,
} from "@/lib/listings/mappers";
import { romanianLocations } from "@/lib/romanian-locations";
import { createClient } from "@/lib/supabase/browser";
import type { ContactPreference } from "@/lib/create-listing-validation";
import type { Tables } from "@/types/database";

const contactOptions: Array<{ value: ContactPreference; label: string }> = [
  { value: "chat", label: "Chat TROKO" },
  { value: "phone", label: "Telefon" },
  { value: "chat-phone", label: "Chat + telefon" },
];

export function ProfileForm({
  initialProfile,
  initialPrivateSettings,
  initialDisplayName,
  isProfileUnavailable = false,
}: {
  initialProfile: Tables<"profiles"> | null;
  initialPrivateSettings: Tables<"profile_private_settings"> | null;
  initialDisplayName: string;
  isProfileUnavailable?: boolean;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(
    initialProfile?.display_name ?? initialDisplayName,
  );
  const [phone, setPhone] = useState(initialPrivateSettings?.phone ?? "");
  const [city, setCity] = useState(initialProfile?.city ?? "");
  const [county, setCounty] = useState(initialProfile?.county ?? "");
  const [contactPreference, setContactPreference] = useState<ContactPreference>(
    mapDbContactPreferenceToUi(initialPrivateSettings?.contact_preference),
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const selectedLocation = romanianLocations.find((item) => item.city === city);
  const locationValue =
    city && county
      ? `${city}|${county}`
      : selectedLocation
        ? `${selectedLocation.city}|${selectedLocation.county}`
        : "";

  function onCityChange(value: string) {
    const [selectedCity = "", selectedCounty = ""] = value.split("|");
    setCity(selectedCity);
    setCounty(selectedCounty);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (fullName.trim().length < 2) {
      setError("Numele afișat trebuie să aibă cel puțin 2 caractere.");
      return;
    }

    const supabase = createClient();

    if (!supabase) {
      setError("Conectarea Supabase nu este configurată local.");
      return;
    }

    setPending(true);
    const { error: updateError } = await updateCurrentProfile(
      {
        displayName: fullName,
        phone,
        city,
        county,
        contactPreference: mapUiContactPreferenceToDb(contactPreference),
      },
      supabase,
    );
    setPending(false);

    if (updateError) {
      setError("Nu am putut salva profilul. Încearcă din nou.");
      return;
    }

    setMessage("Profilul a fost salvat.");
    router.refresh();
  }

  async function logout() {
    if (logoutPending) {
      return;
    }

    const supabase = createClient();

    if (!supabase) {
      router.push("/");
      return;
    }

    setError("");
    setMessage("");
    setLogoutPending(true);

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setError("Deconectarea nu a putut fi finalizată. Încercați din nou.");
        setLogoutPending(false);
        return;
      }
    } catch {
      setError("Deconectarea nu a putut fi finalizată. Încercați din nou.");
      setLogoutPending(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-sm">
      <div className="mb-5">
        <h2 className="text-2xl font-black text-foreground">Profil</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Datele publice și preferințele private sunt salvate în Supabase, cu
          protecție prin RLS.
        </p>
      </div>

      {isProfileUnavailable ? (
        <p className="mb-4 rounded-[1rem] border border-warm/45 bg-secondary p-3 text-sm font-semibold leading-6 text-warm-foreground">
          Profilul din baza de date nu este disponibil încă. Aplică migrarea
          Supabase pentru salvare reală.
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="grid gap-4">
        <Field label="Nume afișat">
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Numele tău"
            className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </Field>

        <Field label="Telefon">
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="07xx xxx xxx"
            inputMode="tel"
            className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Oraș">
            <select
              value={locationValue}
              onChange={(event) => onCityChange(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Alege orașul</option>
              {romanianLocations.map((location) => (
                <option
                  key={`${location.city}-${location.county}`}
                  value={`${location.city}|${location.county}`}
                >
                  {location.city}, {location.county}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Județ">
            <input
              value={county}
              onChange={(event) => setCounty(event.target.value)}
              placeholder="Județ"
              className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </Field>
        </div>

        <Field label="Preferință contact">
          <select
            value={contactPreference}
            onChange={(event) =>
              setContactPreference(event.target.value as ContactPreference)
            }
            className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {contactOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        {error ? (
          <p className="rounded-[1rem] border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-[1rem] border border-brand-border bg-brand-soft p-3 text-sm font-semibold text-primary">
            {message}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={logout}
            disabled={logoutPending}
            className="h-12 rounded-full border-border bg-background px-5 font-bold"
          >
            <LogOut className="size-4" aria-hidden="true" />
            {logoutPending ? "Se deconectează..." : "Ieși din cont"}
          </Button>
          <Button
            disabled={pending}
            className="h-12 rounded-full bg-primary px-5 font-bold text-primary-foreground"
          >
            <Save className="size-4" aria-hidden="true" />
            {pending ? "Se salvează..." : "Salvează profilul"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

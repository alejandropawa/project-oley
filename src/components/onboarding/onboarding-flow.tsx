"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";

import { saveOnboardingProfileAction } from "@/app/actions/trust";
import { createPhoneVerificationRequestAction } from "@/app/actions/verification";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { Button } from "@/components/ui/button";
import { romanianCities } from "@/lib/romanian-cities";
import type { Enums, Tables } from "@/types/database";

export function OnboardingFlow({
  profile,
  privateSettings,
  isUnavailable,
}: {
  profile: Tables<"profiles"> | null;
  privateSettings: Tables<"profile_private_settings"> | null;
  isUnavailable: boolean;
}) {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({
    displayName: profile?.display_name ?? "",
    city: profile?.city ?? "",
    county: profile?.county ?? "",
    bio: profile?.bio ?? "",
    publicLocationLabel: profile?.public_location_label ?? "",
    phone: privateSettings?.phone ?? "",
    contactPreference: privateSettings?.contact_preference ?? "chat",
  });

  const selectedCity = romanianCities.find((city) => city.name === values.city);
  const completed = Boolean(profile?.profile_completed_at);

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function saveProfile(nextStep?: number) {
    setMessage("");
    startTransition(async () => {
      const result = await saveOnboardingProfileAction({
        ...values,
        contactPreference: values.contactPreference as Enums<"contact_preference">,
      });

      if (!result.success) {
        setMessage(result.error ?? "Nu am putut salva profilul.");
        return;
      }

      setMessage("Profilul a fost salvat.");
      if (nextStep !== undefined) {
        setStep(nextStep);
      }
    });
  }

  function requestPhoneVerification() {
    setMessage("");
    startTransition(async () => {
      const result = await createPhoneVerificationRequestAction({
        phone: values.phone,
      });

      setMessage(
        result.success
          ? "Cererea de verificare a telefonului a fost trimisa."
          : result.error ?? "Nu am putut trimite cererea.",
      );
    });
  }

  if (isUnavailable) {
    return (
      <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft-sm">
        <h2 className="text-xl font-black text-foreground">
          Onboarding disponibil dupa configurarea Supabase
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Profilul, verificarile si badge-urile de incredere au nevoie de
          migrarile Supabase aplicate.
        </p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-sm sm:p-6">
      <OnboardingProgress step={step} />

      {completed ? (
        <div className="mt-6 rounded-[1.25rem] border border-[#D5E4DF] bg-[#E8F1EE] p-4">
          <h2 className="font-black text-foreground">Profilul tau este pregatit</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Poti reveni oricand in centrul de incredere pentru verificari si
            review-uri.
          </p>
        </div>
      ) : null}

      <div className="mt-6">
        {step === 0 ? (
          <div className="grid gap-4">
            <h2 className="text-2xl font-black text-foreground">Profil</h2>
            <Field label="Nume afisat">
              <input
                value={values.displayName}
                onChange={(event) => update("displayName", event.target.value)}
                className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Oras">
                <select
                  value={values.city}
                  onChange={(event) => {
                    const city = romanianCities.find(
                      (item) => item.name === event.target.value,
                    );
                    update("city", event.target.value);
                    update("county", city?.county ?? "");
                  }}
                  className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Alege orasul</option>
                  {romanianCities.map((city) => (
                    <option key={city.slug} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Judet">
                <input
                  value={values.county || selectedCity?.county || ""}
                  onChange={(event) => update("county", event.target.value)}
                  className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </Field>
            </div>
            <Field label="Bio scurta">
              <textarea
                value={values.bio}
                onChange={(event) => update("bio", event.target.value)}
                rows={4}
                placeholder="Spune pe scurt ce vinzi, ce cauti sau cum preferi sa colaborezi."
                className="w-full rounded-[1rem] border border-input bg-background px-3 py-3 text-base leading-7 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </Field>
            <Field label="Locatie publica">
              <input
                value={values.publicLocationLabel}
                onChange={(event) => update("publicLocationLabel", event.target.value)}
                placeholder="ex. Bucuresti, zona centrala"
                className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </Field>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4">
            <h2 className="text-2xl font-black text-foreground">Contact</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Telefonul nu este afisat public fara acordul tau. Verificarea lui
              este momentan manuala.
            </p>
            <Field label="Telefon">
              <input
                value={values.phone}
                onChange={(event) => update("phone", event.target.value)}
                placeholder="07xx xxx xxx"
                className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </Field>
            <Field label="Preferinta contact">
              <select
                value={values.contactPreference}
                onChange={(event) =>
                  update(
                    "contactPreference",
                    event.target.value as Enums<"contact_preference">,
                  )
                }
                className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="chat">Chat TROKO</option>
                <option value="phone">Telefon</option>
                <option value="both">Chat + telefon</option>
              </select>
            </Field>
            <Button
              type="button"
              variant="outline"
              onClick={requestPhoneVerification}
              disabled={isPending}
              className="h-11 rounded-full px-5 font-bold"
            >
              Cere verificarea telefonului
            </Button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4">
            <h2 className="text-2xl font-black text-foreground">Incredere</h2>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-1 size-5 shrink-0 text-primary" />
                <div>
                  <p className="font-black text-foreground">
                    Semnalele cresc treptat
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Email confirmat, telefon verificat, profil complet, primul
                    anunt si review-urile primite contribuie la increderea in
                    profil.
                  </p>
                </div>
              </div>
            </div>
            <Button asChild variant="outline" className="h-11 rounded-full font-bold">
              <Link href="/cont/notificari">Setari notificari</Link>
            </Button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4">
            <h2 className="text-2xl font-black text-foreground">Primul pas</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Ai baza pregatita. Alege urmatorul pas potrivit pentru tine.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Button asChild className="h-12 rounded-full bg-primary font-bold text-primary-foreground">
                <Link href="/publica">Publica primul anunt</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full font-bold">
                <Link href="/anunturi">Exploreaza anunturi</Link>
              </Button>
              <Button asChild variant="ghost" className="h-12 rounded-full font-bold">
                <Link href="/cont">Mergi la cont</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {message ? (
        <p className="mt-5 rounded-[1rem] border border-border bg-background p-3 text-sm font-semibold text-muted-foreground">
          {message}
        </p>
      ) : null}

      <div className="mt-6 flex justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 0 || isPending}
          onClick={() => setStep((value) => Math.max(value - 1, 0))}
          className="h-11 rounded-full px-5 font-bold"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Inapoi
        </Button>
        {step < 3 ? (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => saveProfile(step + 1)}
            className="h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground"
          >
            {isPending ? "Se salveaza..." : "Continua"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => saveProfile()}
            className="h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground"
          >
            <Check className="size-4" aria-hidden="true" />
            Salveaza
          </Button>
        )}
      </div>
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


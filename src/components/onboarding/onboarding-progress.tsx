import { cn } from "@/lib/utils";

const steps = ["Profil", "Contact", "Incredere", "Primul pas"];

export function OnboardingProgress({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Progres onboarding">
      {steps.map((label, index) => (
        <li key={label}>
          <div
            className={cn(
              "h-2 rounded-full",
              index <= step ? "bg-primary" : "bg-muted",
            )}
          />
          <p className="mt-2 hidden text-xs font-bold text-muted-foreground sm:block">
            {index + 1}. {label}
          </p>
        </li>
      ))}
    </ol>
  );
}


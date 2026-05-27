import { Handshake, MessageCircle, PencilLine } from "lucide-react";

const steps = [
  {
    title: "Publică rapid",
    description:
      "Adaugi titlul, prețul, orașul și câteva detalii curate. Anunțul intră în flux fără pași inutili.",
    icon: PencilLine,
  },
  {
    title: "Discută în chat",
    description:
      "Întrebările și negocierea rămân într-un spațiu clar, potrivit pentru cumpărători și vânzători.",
    icon: MessageCircle,
  },
  {
    title: "Predă, livrează sau schimbă",
    description:
      "Alegi varianta potrivită: întâlnire locală, livrare sau schimb direct cu cealaltă persoană.",
    icon: Handshake,
  },
];

export function HowItWorks() {
  return (
    <section id="cum-functioneaza" className="bg-background py-12 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase text-primary">
            Cum funcționează
          </p>
          <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
            Trei pași, fără aglomerație
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.title}
                className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="grid size-12 place-items-center rounded-[1rem] bg-muted text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-black text-accent">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-black text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

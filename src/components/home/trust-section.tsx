import { EyeOff, Flag, ShieldCheck, UserRoundCheck } from "lucide-react";

const trustItems = [
  {
    title: "Profiluri mai clare",
    description:
      "TROKO va evidenția istoricul, orașul și semnalele de încredere ale fiecărui profil.",
    icon: UserRoundCheck,
  },
  {
    title: "Raportezi rapid",
    description:
      "Anunțurile suspecte pot fi semnalate ușor, cu motive clare pentru echipa de moderare.",
    icon: Flag,
  },
  {
    title: "Vânzători verificați",
    description:
      "Badge-urile de verificare vor ajuta cumpărătorii să aleagă conversații mai sigure.",
    icon: ShieldCheck,
  },
  {
    title: "Prevenție anti-scam",
    description:
      "Mesaje educative, limite sănătoase și raportare vizibilă pentru tranzacții mai liniștite.",
    icon: EyeOff,
  },
];

export function TrustSection() {
  return (
    <section id="siguranta" className="bg-brand-soft py-12 sm:py-16">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase text-primary">
            Siguranță pe primul loc
          </p>
          <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
            Mai puțină presiune, mai mult control
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            TROKO este gândit pentru anunțuri curate, conversații respectuoase
            și decizii luate fără grabă. Profilurile, raportarea, sellerii
            verificați și prevenția anti-scam vor lucra împreună din primele
            etape ale produsului.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[1.5rem] border border-brand-border bg-card p-5 shadow-soft-sm"
              >
                <span className="grid size-11 place-items-center rounded-[1rem] bg-secondary text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-black text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

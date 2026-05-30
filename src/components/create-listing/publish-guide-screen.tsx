"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  ExternalLink,
  FileText,
  Flag,
  HelpCircle,
  Mail,
  MapPinned,
  Pencil,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  primaryActionButtonClassName,
  primaryActionIconClassName,
} from "@/components/ui/action-styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GuidePageId =
  | "overview"
  | "title"
  | "photos"
  | "rules"
  | "selling"
  | "safety";

const sidebarSteps = [
  {
    label: "Tip și categorie",
    meta: "Definește contextul anunțului",
    state: "current",
  },
  { label: "Detalii", meta: "Completează informațiile esențiale", state: "upcoming" },
  { label: "Fotografii", meta: "Construiește încredere vizuală", state: "upcoming" },
  {
    label: "Preview și publicare",
    meta: "Revizuiește înainte de trimitere",
    state: "upcoming",
  },
] as const;

const guideSections = [
  {
    icon: Pencil,
    title: "1. Scrie un titlu clar și relevant",
    checks: [
      "Începe cu obiectul principal: produs, serviciu sau tip de ofertă",
      "Adaugă diferențiatorul util: model, mărime, stare, zonă sau beneficiu",
      "Păstrează tonul natural, fără majuscule excesive sau semne repetate",
    ],
    aside: (
      <div className="grid gap-2">
        <InfoBox tone="good" title="Exemplu bun">
          Apartament 2 camere, central, renovat
        </InfoBox>
        <InfoBox tone="bad" title="Exemplu de evitat">
          APARTAMENT SUPER!!! CENTRAL!!!
        </InfoBox>
      </div>
    ),
  },
  {
    icon: Camera,
    title: "2. Adaugă fotografii de calitate",
    checks: [
      "Alege prima imagine ca o copertă clară, luminoasă și ușor de înțeles",
      "Combină un cadru complet cu detalii apropiate pentru texturi sau defecte",
      "Păstrează fundalul curat, fără obiecte personale sau dezordine vizuală",
      "Evită filtrele puternice, watermark-urile și fotografiile prea întunecate",
    ],
    aside: <PhotoExamples compact />,
  },
  {
    icon: ShieldCheck,
    title: "3. Oferă informații complete și corecte",
    checks: [
      "Completează câmpurile importante ca anunțul să poată fi filtrat corect",
      "Descrie starea reală, accesoriile incluse și eventualele urme de folosire",
      "Setează un preț realist și precizează dacă accepți negociere",
      "Răspunde rapid și păstrează conversația clară pentru ambele părți",
    ],
    aside: (
      <InfoBox tone="good" title="Sfat">
        Anunțurile complete primesc până la 3x mai multe vizualizări.
      </InfoBox>
    ),
  },
  {
    icon: FileText,
    title: "4. Respectă regulile platformei",
    checks: [
      "Publică doar produse și servicii permise în marketplace",
      "Evită duplicarea aceluiași anunț sau descrierile scrise ca spam",
      "Nu include date personale, linkuri suspecte sau solicitări de plată externă",
      "Verifică textul înainte de publicare pentru un proces de aprobare mai rapid",
    ],
    aside: (
      <InfoBox tone="warning" title="Important">
        Nerespectarea regulilor poate duce la ștergerea anunțului sau blocarea
        contului.
      </InfoBox>
    ),
  },
  {
    icon: Star,
    title: "5. Sfaturi pentru vânzare rapidă",
    checks: [
      "Actualizează anunțul când se schimbă prețul, starea sau disponibilitatea",
      "Răspunde prompt la mesaje și confirmă detaliile importante în scris",
      "Menține un preț competitiv raportat la oferte similare",
      "Fii deschis la negocieri rezonabile, dar clar în privința limitelor",
    ],
    aside: (
      <InfoBox tone="good" title="Recomandare">
        Anunțurile actualizate în ultimele 7 zile au cu până la 50% mai multe
        șanse de vânzare.
      </InfoBox>
    ),
  },
];

const quickLinks: Array<{
  id: GuidePageId;
  icon: LucideIcon;
  label: string;
}> = [
  { id: "title", icon: Pencil, label: "Cum scriu un titlu bun?" },
  { id: "photos", icon: Camera, label: "Fotografii recomandate" },
  { id: "rules", icon: Flag, label: "Reguli de publicare" },
  { id: "selling", icon: Star, label: "Sfaturi pentru vânzare" },
  { id: "safety", icon: ShieldCheck, label: "Siguranță și încredere" },
];

const safetyItems = [
  { icon: ShieldCheck, label: "Nu trimite bani în avans" },
  { icon: ShieldCheck, label: "Întâlnește-te în locuri publice" },
  { icon: ShieldCheck, label: "Verifică produsul înainte de cumpărare" },
  { icon: MapPinned, label: "Raportează comportamentul suspect" },
];

const photoExamples = [
  {
    title: "Lumină naturală",
    body: "O canapea fotografiată lângă fereastră arată corect culoarea, textura și proporțiile produsului.",
    src: "/images/create-listing/photo-natural-light.webp",
    alt: "Fotografie de anunț cu o canapea surprinsă în lumină naturală",
  },
  {
    title: "Cadru complet",
    body: "Produsul este vizibil integral, cu spațiu în jur, astfel încât proporțiile sunt ușor de înțeles.",
    src: "/images/create-listing/photo-complete-frame.webp",
    alt: "Fotografie de anunț cu o bicicletă încadrată complet",
  },
  {
    title: "Detaliu util",
    body: "Un close-up al unui iPad zgâriat arată transparent starea reală și detaliile care contează.",
    src: "/images/create-listing/photo-scratched-ipad.webp",
    alt: "Fotografie de detaliu cu un iPad zgâriat",
  },
  {
    title: "Fundal curat",
    body: "Un spațiu ordonat păstrează atenția pe produs și transmite mai multă grijă pentru anunț.",
    src: "/images/create-listing/photo-clean-background.webp",
    alt: "Fotografie de anunț cu o unealtă pe un banc de lucru curat",
  },
] as const;

export function PublishGuideScreen({ onContinue }: { onContinue: () => void }) {
  const [activePage, setActivePage] = useState<GuidePageId>("overview");

  return (
    <div
      className="mx-auto flex w-full flex-col overflow-hidden rounded-[1rem] border border-[#DDE3DF] bg-[#FFFEFC] text-[#102A27] shadow-[0_22px_72px_rgba(15,70,61,0.10)]"
      style={{
        WebkitFontSmoothing: "antialiased",
        textRendering: "optimizeLegibility",
      }}
    >
      <header className="flex min-h-[4.6rem] items-center justify-between gap-4 border-b border-[#DDE3DF] bg-[#FFFEFC]/98 px-5 py-3 sm:px-8">
        <div>
          <h1 className="text-[18px] font-semibold leading-[24px] text-[#0E2522]">
            Ghid de publicare
          </h1>
          <p className="text-[14px] font-normal leading-[20px] text-[#66736F]">
            Tot ce trebuie să știi pentru a crea un anunț eficient.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onContinue}
          aria-label="Închide ghidul"
          className="h-10 rounded-[0.45rem] border-[#DDE3DF] bg-white px-4 text-[14px] font-semibold leading-[20px] text-[#102A27] shadow-sm transition hover:border-[#89B29E] hover:bg-[#F5FAF7] hover:text-[#0B4A3E]"
        >
          <span className="hidden sm:inline">Închide ghidul</span>
          <X className="size-4" aria-hidden="true" />
        </Button>
      </header>

      <div className="grid lg:grid-cols-[14.5rem_1fr]">
        <aside className="border-b border-[#DDE3DF] bg-[#FFFEFC]/92 px-6 py-9 lg:border-b-0 lg:border-r">
          <GuideSteps />
        </aside>

        <main className="grid xl:grid-cols-[minmax(0,1fr)_23.5rem]">
          <section className="px-5 py-6 sm:px-8 lg:px-8">
            <div key={activePage}>
              {renderGuidePage(activePage, setActivePage)}
            </div>
          </section>

          <aside className="border-t border-[#DDE3DF] bg-[#FFFEFC] px-5 py-6 sm:px-7 xl:border-l xl:border-t-0">
            <div className="grid gap-5 xl:sticky xl:top-6">
              <SidePanel title="Navighează rapid">
                <div className="grid gap-1">
                  {quickLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setActivePage(item.id)}
                        className={cn(
                          "group flex h-9 items-center justify-between gap-3 rounded-[0.5rem] px-1 text-left text-[14px] font-medium leading-[20px] text-[#102A27] transition hover:bg-[#F4F9F6] hover:px-2 hover:text-[#0B4A3E]",
                          isActive && "bg-[#F4F9F6] px-2 text-[#0B4A3E]",
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <Icon
                            className="size-4 shrink-0 text-[#0B4A3E]"
                            aria-hidden="true"
                          />
                          <span className="truncate">{item.label}</span>
                        </span>
                        <ChevronRight
                          className="size-4 shrink-0 text-[#66736F] transition group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </SidePanel>

              <SidePanel title="Siguranță și încredere">
                <ul className="grid gap-3">
                  {safetyItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <li
                        key={item.label}
                        className="flex items-start gap-3 text-[14px] font-medium leading-[20px] text-[#102A27]"
                      >
                        <Icon
                          className="mt-0.5 size-4 shrink-0 text-[#0B4A3E]"
                          aria-hidden="true"
                        />
                        {item.label}
                      </li>
                    );
                  })}
                </ul>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActivePage("safety")}
                  className="mt-5 h-9 w-full rounded-[0.45rem] border-[#DDE3DF] bg-white text-[14px] font-semibold leading-[20px] text-[#102A27] shadow-sm transition hover:border-[#89B29E] hover:bg-[#F5FAF7] hover:text-[#0B4A3E]"
                >
                  Află mai multe
                  <ExternalLink className="size-4" aria-hidden="true" />
                </Button>
              </SidePanel>

              <div className="rounded-[0.65rem] border border-[#EFE4D4] bg-[#F6EEE2] p-4 shadow-sm">
                <h3 className="text-[16px] font-semibold leading-[22px] text-[#0E2522]">
                  Ai nevoie de ajutor?
                </h3>
                <p className="mt-2 text-[13px] font-normal leading-[20px] text-[#66736F]">
                  Echipa Troko îți stă la dispoziție pentru orice întrebare sau
                  nelămurire.
                </p>
                <div className="mt-4 grid gap-2">
                  <HelpAction icon={Mail} title="Contactează-ne">
                    Răspundem în 24h
                  </HelpAction>
                  <HelpAction icon={HelpCircle} title="Centrul de ajutor">
                    Întrebări frecvente
                  </HelpAction>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>

      <footer className="border-t border-[#DDE3DF] bg-[#FFFEFC]/98 px-6 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onContinue}
            className="h-10 rounded-[0.45rem] border-[#DDE3DF] bg-white px-6 text-[14px] font-semibold leading-[20px] text-[#0B4A3E] shadow-sm transition hover:border-[#89B29E] hover:bg-[#F5FAF7]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Înapoi la editor
          </Button>
          <button
            type="button"
            onClick={onContinue}
            className={cn(
              "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border border-transparent outline-none transition focus-visible:ring-3 focus-visible:ring-[#0F7A57]/25 disabled:pointer-events-none disabled:opacity-50",
              primaryActionButtonClassName,
              "h-10 min-w-[17.5rem] rounded-[0.45rem] px-8 text-[14px] font-semibold leading-[20px]",
            )}
          >
            Continuă spre publicare
            <ArrowRight
              className={cn("size-4", primaryActionIconClassName)}
              aria-hidden="true"
            />
          </button>
        </div>
      </footer>
    </div>
  );
}

function renderGuidePage(
  activePage: GuidePageId,
  setActivePage: (page: GuidePageId) => void,
) {
  if (activePage === "overview") {
    return (
      <>
        <h2 className="text-[24px] font-semibold leading-[32px] text-[#0E2522]">
          Cum creezi un anunț eficient
        </h2>
        <p className="mt-1 text-[14px] font-normal leading-[22px] text-[#66736F]">
          Urmărește aceste recomandări pentru mai multe vizualizări și contacte.
        </p>

        <div className="mt-5 grid gap-2.5">
          {guideSections.map((section) => (
            <GuideSection key={section.title} section={section} />
          ))}
        </div>
      </>
    );
  }

  if (activePage === "photos") {
    return (
      <GuideArticlePage
        title="Fotografii recomandate"
        description="Fotografiile bune transmit rapid starea produsului și reduc întrebările repetitive."
        onBack={() => setActivePage("overview")}
      >
        <PhotoExamples />
        <GuideChecklist
          title="Checklist rapid"
          items={[
            "Prima fotografie trebuie să arate produsul complet.",
            "Adaugă un cadru apropiat pentru detalii, defecte sau texturi.",
            "Păstrează fundalul curat și evită zonele prea întunecate.",
            "Fotografiază în lumină naturală, fără filtre agresive.",
          ]}
        />
      </GuideArticlePage>
    );
  }

  const pageContent = {
    title: {
      title: "Cum scriu un titlu bun?",
      description:
        "Un titlu bun este scurt, concret și spune imediat ce vinzi sau ce cauți.",
      tips: [
        "Folosește 6-10 cuvinte, suficient cât să fie clar fără să devină încărcat.",
        "Pune informația cea mai importantă în prima parte a titlului.",
        "Evită promisiunile vagi și păstrează formularea verificabilă.",
        "Revizuiește titlul ca și cum l-ai vedea într-o listă cu zeci de rezultate.",
      ],
      cards: [
        {
          title: "Include detaliul decisiv",
          body: "Modelul, dimensiunea, orașul sau starea produsului ajută anunțul să fie înțeles din prima.",
        },
        {
          title: "Evită formulările generice",
          body: "Titluri precum „super ofertă” sau „urgent” nu ajută căutarea și pot părea mai puțin credibile.",
        },
        {
          title: "Scrie natural",
          body: "Folosește propoziții clare, fără majuscule excesive sau semne de punctuație repetate.",
        },
      ],
    },
    rules: {
      title: "Reguli de publicare",
      description:
        "Regulile păstrează marketplace-ul curat, sigur și ușor de parcurs.",
      tips: [
        "Publică anunțul în categoria care descrie cel mai bine produsul sau serviciul.",
        "Nu folosi fotografii preluate din alte surse dacă nu reprezintă produsul real.",
        "Nu repeta același anunț cu titluri ușor diferite.",
        "Elimină din descriere numere personale, linkuri externe și solicitări de plată directă.",
      ],
      cards: [
        {
          title: "Publică un singur anunț pentru același produs",
          body: "Anunțurile duplicate reduc calitatea rezultatelor și pot fi eliminate.",
        },
        {
          title: "Folosește informații reale",
          body: "Prețul, starea produsului și localitatea trebuie să fie corecte.",
        },
        {
          title: "Nu include date sensibile",
          body: "Păstrează conversația în platformă și evită date personale în descriere.",
        },
      ],
    },
    selling: {
      title: "Sfaturi pentru vânzare",
      description:
        "Un anunț complet și actualizat primește mai multă încredere de la cumpărători.",
      tips: [
        "Menționează ce este inclus în preț: accesorii, garanție, transport sau montaj.",
        "Actualizează disponibilitatea imediat ce produsul este rezervat sau vândut.",
        "Păstrează un ton profesionist în mesaje, chiar și când negociezi.",
        "Adaugă detalii care răspund întrebărilor probabile înainte să fie trimise.",
      ],
      cards: [
        {
          title: "Răspunde rapid",
          body: "Primele mesaje sunt cele mai importante. Un răspuns rapid crește șansa de finalizare.",
        },
        {
          title: "Explică starea produsului",
          body: "Menționează clar dacă produsul este nou, folosit, reparat sau are urme vizibile.",
        },
        {
          title: "Alege un preț realist",
          body: "Compară oferte similare și lasă loc pentru negociere doar dacă este cazul.",
        },
      ],
    },
    safety: {
      title: "Siguranță și încredere",
      description:
        "Cumpără și vinde local, cu pași simpli care reduc riscurile.",
      tips: [
        "Verifică produsul în lumină bună înainte să finalizezi tranzacția.",
        "Pentru produse scumpe, stabilește întâlnirea într-un loc public și circulat.",
        "Nu trimite coduri, documente personale sau date bancare în conversație.",
        "Raportează rapid mesajele care par automate, insistente sau neobișnuite.",
      ],
      cards: [
        {
          title: "Nu trimite bani în avans",
          body: "Finalizează tranzacția doar când ai verificat produsul și condițiile de livrare.",
        },
        {
          title: "Întâlnește-te în locuri publice",
          body: "Alege zone circulate și evită schimburile în locuri izolate.",
        },
        {
          title: "Raportează comportamentul suspect",
          body: "Semnalează mesajele neobișnuite, presiunea de plată sau cererile de date sensibile.",
        },
      ],
    },
  }[activePage];

  return (
    <GuideArticlePage
      title={pageContent.title}
      description={pageContent.description}
      onBack={() => setActivePage("overview")}
    >
      <div className="grid gap-3">
        {pageContent.cards.map((card) => (
          <InfoBox key={card.title} tone="good" title={card.title}>
            {card.body}
          </InfoBox>
        ))}
      </div>
      <GuideChecklist title="Recomandări aplicabile" items={pageContent.tips} />
    </GuideArticlePage>
  );
}

function GuideSteps() {
  return (
    <ol className="space-y-0">
      {sidebarSteps.map((item, index) => {
        const isCurrent = item.state === "current";

        return (
          <li key={item.label} className="relative flex gap-3 pb-8 last:pb-0">
            {index < sidebarSteps.length - 1 ? (
              <span className="absolute left-[0.84rem] top-8 h-[calc(100%-2rem)] w-px bg-[#8DBAA5]" />
            ) : null}
            <span
              className={cn(
                "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border text-[13px] font-semibold leading-[20px] shadow-sm",
                isCurrent
                  ? "border-[#0B4A3E] bg-[#0B4A3E] text-white"
                  : "border-[#DDE3DF] bg-[#FFFEFC] text-[#8A9691]",
              )}
            >
              {index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  isCurrent
                    ? "text-[14px] font-semibold leading-[20px] text-[#0B4A3E]"
                    : "text-[13px] font-medium leading-[20px] text-[#8A9691]",
                )}
              >
                {item.label}
              </p>
              <p className="mt-0.5 text-[13px] font-normal leading-[18px] text-[#66736F]">
                {item.meta}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function GuideSection({
  section,
}: {
  section: (typeof guideSections)[number];
}) {
  const Icon = section.icon;

  return (
    <article
      className="grid gap-4 rounded-[0.55rem] border border-[#DDE3DF] bg-white p-4 shadow-[0_8px_24px_rgba(15,70,61,0.035)] md:grid-cols-[3.35rem_minmax(0,1fr)_minmax(13.5rem,0.4fr)]"
    >
      <span className="grid size-11 place-items-center rounded-full bg-[#EAF4EA] text-[#0B4A3E]">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <h3 className="text-[17px] font-semibold leading-[24px] text-[#0E2522]">
          {section.title}
        </h3>
        <ul className="mt-2 grid gap-1">
          {section.checks.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[14px] font-normal leading-[22px] text-[#102A27]"
            >
              <Check
                className="mt-0.5 size-3.5 shrink-0 text-[#0F7A57]"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="md:self-center">{section.aside}</div>
    </article>
  );
}

function GuideArticlePage({
  children,
  description,
  onBack,
  title,
}: {
  children: React.ReactNode;
  description: string;
  onBack: () => void;
  title: string;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-[14px] font-semibold leading-[20px] text-[#0B4A3E] transition hover:text-[#063B32]"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Înapoi la ghid
      </button>
      <h2 className="text-[24px] font-semibold leading-[32px] text-[#0E2522]">
        {title}
      </h2>
      <p className="mt-1 text-[14px] font-normal leading-[22px] text-[#66736F]">
        {description}
      </p>
      <div className="mt-5">{children}</div>
    </>
  );
}

function GuideChecklist({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="mt-4 rounded-[0.65rem] border border-[#DDE3DF] bg-white p-4 shadow-sm">
      <h3 className="text-[17px] font-semibold leading-[24px] text-[#0E2522]">
        {title}
      </h3>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-[14px] font-normal leading-[22px] text-[#102A27]"
          >
            <Check
              className="mt-1 size-3.5 shrink-0 text-[#0F7A57]"
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function InfoBox({
  children,
  title,
  tone,
}: {
  children: React.ReactNode;
  title: string;
  tone: "good" | "bad" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-[0.45rem] p-2.5",
        tone === "good" && "bg-[#EEF6EE] text-[#24473B]",
        tone === "bad" && "bg-[#FBEDED] text-[#7C2A2A]",
        tone === "warning" && "bg-[#FFF6E6] text-[#7A5718]",
      )}
    >
      <p className="text-[13px] font-semibold leading-[18px]">{title}</p>
      <p className="mt-1 text-[13px] font-normal leading-[20px]">{children}</p>
    </div>
  );
}

function PhotoExamples({ compact = false }: { compact?: boolean }) {
  const [selectedPhoto, setSelectedPhoto] =
    useState<(typeof photoExamples)[number] | null>(null);

  return (
    <>
      <div
        className={cn(
          "grid gap-3",
          compact ? "grid-cols-2" : "sm:grid-cols-2",
        )}
      >
        {photoExamples.map((example) => (
          <button
            key={example.title}
            type="button"
            onClick={() => setSelectedPhoto(example)}
            className="group overflow-hidden rounded-[0.55rem] border border-[#DDE3DF] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#89B29E] hover:shadow-[0_12px_30px_rgba(15,70,61,0.10)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#0B4A3E]/20"
          >
            <span
              className={cn(
                "relative block overflow-hidden",
                compact ? "aspect-[4/3]" : "aspect-[16/9]",
              )}
            >
              <Image
                src={example.src}
                alt={example.alt}
                fill
                sizes={compact ? "9rem" : "(min-width: 768px) 22rem, 100vw"}
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            </span>
            {!compact ? (
              <span className="block p-3">
                <span className="block text-[13px] font-semibold leading-[18px] text-[#0E2522]">
                  {example.title}
                </span>
                <span className="mt-1 block text-[13px] font-normal leading-[20px] text-[#66736F]">
                  {example.body}
                </span>
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {selectedPhoto ? (
        <button
          type="button"
          aria-label="Închide fotografia"
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-[120] grid cursor-zoom-out place-items-center bg-[#061915]/72 p-4 backdrop-blur-sm"
        >
          <span className="w-full max-w-3xl overflow-hidden rounded-[1rem] border border-white/60 bg-[#FFFEFC] p-2 shadow-[0_28px_90px_rgba(2,24,20,0.34)]">
            <span className="relative block aspect-[4/3] overflow-hidden rounded-[0.75rem]">
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                fill
                sizes="min(92vw, 48rem)"
                className="object-cover"
                priority
              />
            </span>
            <span className="block px-3 py-3 text-left">
              <span className="block text-[14px] font-semibold leading-[20px] text-[#0E2522]">
                {selectedPhoto.title}
              </span>
              <span className="mt-1 block text-[13px] font-normal leading-[20px] text-[#66736F]">
                {selectedPhoto.body}
              </span>
            </span>
          </span>
        </button>
      ) : null}
    </>
  );
}

function SidePanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[0.65rem] border border-[#DDE3DF] bg-white p-4 shadow-sm">
      <h3 className="text-[16px] font-semibold leading-[22px] text-[#0E2522]">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function HelpAction({
  children,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 rounded-[0.55rem] border border-[#DDE3DF] bg-white p-3 text-left shadow-sm transition hover:border-[#89B29E] hover:bg-[#FFFEFC]"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#EAF4EA] text-[#0B4A3E]">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-[13px] font-semibold leading-[18px] text-[#0E2522]">
          {title}
        </span>
        <span className="mt-0.5 block text-[13px] font-normal leading-[20px] text-[#66736F]">
          {children}
        </span>
      </span>
    </button>
  );
}

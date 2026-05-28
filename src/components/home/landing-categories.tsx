import Link from "next/link";

import { categoryIcons } from "@/components/categories/category-icons";
import { categories } from "@/lib/mock-data";

const landingCategorySlugs = [
  "electronice",
  "imobiliare",
  "auto",
  "casa-gradina",
  "sport",
  "fashion",
  "copii-bebe",
  "servicii",
  "inchirieri",
  "schimburi",
  "joburi",
  "afaceri-echipamente",
  "animale",
  "agricultura",
  "hobby-arta",
  "turism-evenimente",
] as const;

type LandingCategorySlug = (typeof landingCategorySlugs)[number];
type Category = (typeof categories)[number];

const landingCategoryLabels: Record<LandingCategorySlug, string> = {
  imobiliare: "Imobiliare",
  auto: "Auto",
  electronice: "Electronice",
  "casa-gradina": "Casă",
  fashion: "Fashion",
  sport: "Sport",
  "copii-bebe": "Copii",
  servicii: "Servicii",
  inchirieri: "Închirieri",
  schimburi: "Schimburi",
  joburi: "Joburi",
  "afaceri-echipamente": "Afaceri",
  animale: "Animale",
  agricultura: "Agricultură",
  "hobby-arta": "Hobby",
  "turism-evenimente": "Turism",
};

function isCategory(category: Category | undefined): category is Category {
  return Boolean(category);
}

export function LandingCategories() {
  const landingCategories = landingCategorySlugs
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter(isCategory);

  return (
    <nav
      aria-label="Categorii populare"
      className="landingCategoryNav mt-8 w-full pb-1 sm:mt-10 min-[1800px]:mt-12"
    >
      <div className="landingCategoryWrap mx-auto w-full max-w-[62rem] pb-2 min-[1800px]:max-w-[64rem]">
        <div className="landingCategoryGrid grid grid-cols-4 items-start justify-items-center gap-x-1 gap-y-4 sm:gap-x-2 sm:gap-y-5 md:grid-cols-8 lg:gap-x-3 xl:gap-y-5">
          {landingCategories.map((category) => {
            const Icon = categoryIcons[category.iconName];
            const label =
              landingCategoryLabels[category.slug as LandingCategorySlug] ??
              category.name;

            return (
              <Link
                key={category.slug}
                href={`/categorii/${category.slug}`}
                aria-label={`Vezi categoria ${category.name}`}
                className="landingCategoryItem group flex min-h-[5.1rem] w-full max-w-[5.25rem] min-w-0 flex-col items-center justify-start gap-1.5 rounded-[0.9rem] px-1 py-1 text-center text-brand-ink transition hover:-translate-y-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30 sm:min-h-[5.35rem] xl:min-h-[5.2rem]"
              >
                <span className="landingCategoryIcon grid size-11 shrink-0 place-items-center rounded-[0.95rem] border border-brand-border bg-card/90 shadow-[0_10px_24px_rgba(15,70,61,0.075)] transition duration-300 group-hover:scale-105 group-hover:border-primary/35 group-hover:bg-white group-hover:shadow-[0_14px_30px_rgba(15,70,61,0.12)] min-[390px]:size-12 sm:rounded-[1rem] md:size-12">
                  <Icon
                    className="size-5 text-brand"
                    aria-hidden="true"
                  />
                </span>

                <span className="landingCategoryLabel flex min-h-7 w-full max-w-[6.25rem] items-start justify-center text-center text-[0.66rem] font-bold leading-tight text-brand-ink [text-shadow:0_1px_14px_rgba(255,254,252,0.96)] min-[390px]:text-[0.7rem] sm:text-[0.72rem] xl:max-w-[5.5rem]">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

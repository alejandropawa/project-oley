import { LandingCategories } from "@/components/home/landing-categories";
import { LandingSearch } from "@/components/home/landing-search";

export function MinimalLanding() {
  return (
    <section className="relative isolate min-h-[calc(100svh_-_4rem_+_1px)] overflow-x-hidden text-foreground lg:min-h-[calc(100svh_-_4.5rem_+_1px)] min-[1800px]:min-h-[calc(100svh_-_5rem_+_1px)]">
      <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-[var(--landing-shell-max)] flex-col px-5 pb-8 pt-10 sm:px-7 sm:pb-9 sm:pt-12 lg:px-8 lg:pt-10">
        <div className="mx-auto flex w-full max-w-[var(--landing-content-max)] flex-1 flex-col items-center justify-start text-center sm:justify-center lg:justify-center">
          <h1 className="landingHeroTitle max-w-[56rem] text-balance font-heading text-[2.15rem] font-semibold leading-[1.05] text-brand min-[390px]:text-[2.35rem] sm:text-[2.75rem] md:text-[3.05rem] xl:text-[3.35rem]">
            <span className="block">Găsește ce ai nevoie.</span>
            <span className="block">Vinde ce nu mai folosești.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-6 text-brand-muted sm:text-base">
            Anunțuri locale pentru vânzare, cumpărare, închiriere și schimb, într-un spațiu curat și rapid.
          </p>

          <div className="mt-7 w-full max-w-[var(--landing-content-max)] sm:mt-8">
            <LandingSearch />
            <LandingCategories />
          </div>
        </div>
      </div>
    </section>
  );
}

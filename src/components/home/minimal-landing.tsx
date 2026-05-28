import { LandingCategories } from "@/components/home/landing-categories";
import { LandingSearch } from "@/components/home/landing-search";

export function MinimalLanding() {
  return (
    <section className="relative isolate min-h-[calc(100svh_-_4rem_+_1px)] overflow-x-hidden text-foreground lg:min-h-[calc(100svh_-_4.5rem_+_1px)] min-[1800px]:min-h-[calc(100svh_-_5rem_+_1px)]">
      <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-[var(--landing-shell-max)] flex-col px-5 pb-8 sm:px-7 sm:pb-9 lg:px-8">
        <div className="mx-auto flex w-full max-w-[var(--landing-content-max)] flex-1 -translate-y-9 flex-col items-center justify-center py-5 text-center sm:-translate-y-10 sm:py-7 lg:-translate-y-12 lg:py-8">
          <p className="text-xs font-black uppercase tracking-normal text-primary sm:text-sm">
            SIMPLU. LOCAL. RAPID.
          </p>
          <h1 className="landingHeroTitle mt-3 max-w-[56rem] text-balance font-serif text-[2.15rem] font-semibold leading-[1.05] text-brand min-[390px]:text-[2.35rem] sm:text-[2.75rem] md:text-[3.05rem] xl:text-[3.35rem]">
            <span className="block">Găsește ce ai nevoie.</span>
            <span className="block">Vinde ce nu mai folosești.</span>
          </h1>
          <p
            aria-hidden="true"
            className="mx-auto mt-3 min-h-5 max-w-2xl text-pretty text-sm leading-6 text-brand-muted"
          />

          <div className="mt-7 w-full max-w-[var(--landing-content-max)] sm:mt-8">
            <LandingSearch />
            <LandingCategories />
          </div>
        </div>
      </div>
    </section>
  );
}

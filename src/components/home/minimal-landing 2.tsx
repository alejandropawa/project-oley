import { LandingCategories } from "@/components/home/landing-categories";
import { LandingSearch } from "@/components/home/landing-search";

export function MinimalLanding() {
  return (
    <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-x-hidden text-[#171717]">
      <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-[var(--landing-shell-max)] flex-col px-5 pb-8 sm:px-7 sm:pb-9 lg:px-8">
        <div className="mx-auto flex w-full max-w-[var(--landing-content-max)] flex-1 -translate-y-9 flex-col items-center justify-center py-5 text-center sm:-translate-y-10 sm:py-7 lg:-translate-y-12 lg:py-8">
          <p className="text-xs font-black uppercase tracking-normal text-brand sm:text-sm">
            SIMPLU. LOCAL. RAPID.
          </p>
          <h1 className="landingHeroTitle mt-3 max-w-[58rem] text-balance font-serif text-[2.25rem] font-semibold leading-[1.04] text-brand min-[390px]:text-[2.45rem] sm:text-[3rem] md:text-[3.35rem] xl:text-[3.85rem]">
            <span className="block">Găsește ce ai nevoie.</span>
            <span className="block">Vinde ce nu mai folosești.</span>
          </h1>
          <p
            aria-hidden="true"
            className="mx-auto mt-3 min-h-5 max-w-2xl text-pretty text-sm leading-6 text-[#53635E]"
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

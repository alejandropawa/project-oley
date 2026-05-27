import { LandingCategories } from "@/components/home/landing-categories";
import { LandingSearch } from "@/components/home/landing-search";

export function MinimalLanding() {
  return (
    <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-x-hidden text-[#171717]">
      <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-[1480px] flex-col px-5 pb-8 sm:px-8 sm:pb-10 lg:px-10">
        <div className="mx-auto flex w-full max-w-[82rem] flex-1 -translate-y-14 flex-col items-center justify-center py-6 text-center sm:-translate-y-12 sm:py-8 lg:-translate-y-12 lg:py-10">
          <p className="text-xs font-black uppercase tracking-normal text-[#2F6F65] sm:text-sm">
            SIMPLU. LOCAL. RAPID.
          </p>
          <h1 className="mt-4 max-w-[58rem] text-balance font-serif text-[2.35rem] font-semibold leading-[1.04] text-[#0F4A43] min-[390px]:text-4xl sm:text-5xl lg:text-[3.85rem]">
            <span className="block">Găsește ce ai nevoie.</span>
            <span className="block">Vinde ce nu mai folosești.</span>
          </h1>
          <p
            aria-hidden="true"
            className="mx-auto mt-4 min-h-6 max-w-2xl text-pretty text-sm leading-6 text-[#53635E] sm:text-base"
          />

          <div className="mt-7 w-full max-w-[82rem] sm:mt-8">
            <LandingSearch />
            <LandingCategories />
          </div>
        </div>
      </div>
    </section>
  );
}

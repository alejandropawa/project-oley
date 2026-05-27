import { MapPinned } from "lucide-react";

import type { RomanianCity } from "@/lib/romanian-cities";

export function CityHero({ city }: { city: RomanianCity }) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
      <div>
        <span className="grid size-14 place-items-center rounded-[1.25rem] border border-[#E8E1D8] bg-[#FFFDF8]/88 text-[#0F4A43] shadow-[0_14px_34px_rgba(15,70,61,0.1)]">
          <MapPinned className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-serif text-5xl font-semibold leading-none text-[#0F4A43] sm:text-6xl">
          Anunțuri în {city.name}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#2F3E3A]">
          Descoperă anunțuri locale pentru vânzare, cumpărare, închiriere și
          schimb în {city.name}, {city.county}.
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-[#E8E1D8]/90 bg-[#FFFDF8]/88 p-4 text-sm leading-6 text-[#52645F] shadow-[0_18px_48px_rgba(15,70,61,0.1)] backdrop-blur">
        <p className="font-black text-[#123F37]">
          Marketplace local, fără aglomerație.
        </p>
        <p className="mt-1">
          TROKO organizează anunțurile pe orașe ca să găsești rapid produse,
          locuințe, servicii și schimburi aproape de tine.
        </p>
      </div>
    </div>
  );
}

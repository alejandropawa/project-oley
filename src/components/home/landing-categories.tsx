import Link from "next/link";

import { categoryIcons } from "@/components/categories/category-icons";
import { categories } from "@/lib/mock-data";

export function LandingCategories() {
  return (
    <nav aria-label="Categorii rapide" className="mt-14 w-full pb-1 sm:mt-16">
      <div className="mx-auto w-full max-w-[44rem]">
        <div className="grid grid-cols-5 items-start justify-items-center gap-x-0.5 gap-y-7 min-[520px]:gap-x-2 sm:gap-x-4 sm:gap-y-8 lg:gap-x-5">
          {categories.map((category) => {
            const Icon = categoryIcons[category.iconName];

            return (
              <Link
                key={category.slug}
                href={`/categorii/${category.slug}`}
                aria-label={`Vezi categoria ${category.name}`}
                className="group flex min-h-[5.8rem] w-full min-w-0 flex-col items-center justify-start gap-2.5 text-center text-[#153C36] transition hover:-translate-y-1 hover:text-[#2F6F65] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2F6F65]/30"
              >
                <span className="grid size-11 place-items-center rounded-[1rem] border border-[#DDE8E4] bg-[#FFFDF8]/90 shadow-[0_12px_30px_rgba(15,70,61,0.08)] transition duration-300 group-hover:scale-105 group-hover:border-[#2F6F65]/35 group-hover:bg-white group-hover:shadow-[0_18px_38px_rgba(15,70,61,0.13)] min-[390px]:size-12 min-[520px]:size-14 sm:rounded-[1.15rem] lg:size-16 lg:rounded-[1.25rem]">
                  <Icon
                    className="size-5 text-[#0F4A43] min-[520px]:size-6 lg:size-7"
                    aria-hidden="true"
                  />
                </span>

                <span className="max-w-full whitespace-nowrap text-[0.5rem] font-bold leading-tight text-[#153C36] [text-shadow:0_1px_14px_rgba(255,253,248,0.96)] min-[390px]:text-[0.52rem] min-[520px]:text-[0.68rem] sm:text-xs lg:text-[0.82rem]">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

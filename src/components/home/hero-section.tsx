import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";

import { categoryIcons } from "@/components/categories/category-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/mock-data";

export function HeroSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl text-center">
          <p className="text-sm font-black uppercase text-primary">
            troko.ro
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl text-balance text-3xl font-black leading-[1.04] text-foreground sm:text-5xl lg:text-6xl min-[1800px]:text-7xl">
            Găsește ce ai nevoie, aproape de tine.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            Marketplace românesc pentru vânzare, cumpărare, închiriere și
            schimb. Simplu, local, ușor de folosit pe mobil.
          </p>

          <form
            action="/anunturi"
            aria-label="Caută anunțuri TROKO"
            className="mx-auto mt-8 grid w-full max-w-4xl gap-3 rounded-[1.75rem] border border-border bg-card p-2 shadow-soft sm:grid-cols-[1fr_auto]"
          >
            <div className="flex min-w-0 items-center gap-3 rounded-[1.35rem] bg-background px-4 py-3 sm:px-5">
              <Search
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <label htmlFor="home-search" className="sr-only">
                Caută anunțuri
              </label>
              <Input
                id="home-search"
                name="q"
                type="search"
                placeholder="Caută telefoane, biciclete, apartamente..."
                className="h-12 border-0 bg-transparent p-0 text-base shadow-none placeholder:text-muted-foreground focus-visible:ring-0 sm:text-lg"
              />
            </div>
            <Button className="h-14 rounded-[1.35rem] bg-action px-7 text-base font-black text-action-foreground shadow-soft-sm hover:bg-action-hover">
              Caută
              <ArrowRight className="size-5" aria-hidden="true" />
            </Button>
          </form>

          <div className="mt-4 flex justify-center">
            <Link
              href="/anunturi"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-bold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
            >
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              Toată România
            </Link>
          </div>

          <nav
            aria-label="Categorii rapide"
            className="mx-auto mt-7 grid max-w-5xl grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
          >
            {categories.map((category) => {
              const Icon = categoryIcons[category.iconName];

              return (
                <Link
                  key={category.slug}
                  href={`/categorii/${category.slug}`}
                  className="group flex min-h-16 items-center gap-3 rounded-[1.25rem] border border-border bg-card p-3 text-left shadow-soft-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-[0.9rem] bg-muted text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 text-sm font-black leading-5 text-foreground">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </section>
  );
}

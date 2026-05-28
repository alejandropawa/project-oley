import { CategoryGrid } from "@/components/categories/category-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { categories } from "@/lib/mock-data";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { createPublicMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";

export const metadata = createPublicMetadata({
  title: "Categorii TROKO — Explorează anunțuri pe categorii",
  description:
    "Explorează categoriile TROKO pentru vânzare, cumpărare, închiriere și schimb.",
  path: "/categorii",
});

export default function CategoriesPage() {
  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Acasă", url: absoluteUrl("/") },
            { name: "Categorii", url: absoluteUrl("/categorii") },
          ])}
        />
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Breadcrumbs
              items={[{ label: "Acasă", href: "/" }, { label: "Categorii" }]}
            />
            <div className="mt-8 max-w-3xl">
              <p className="text-sm font-bold uppercase text-primary">
                Categorii TROKO
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-foreground sm:text-4xl min-[1800px]:text-5xl">
                Explorează anunțuri pe categorii
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Alege zona potrivită și intră într-un flux de anunțuri curate,
                ușor de scanat și pregătite pentru conversații locale.
              </p>
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-border bg-card p-4 text-sm font-semibold text-muted-foreground shadow-soft-sm">
              {categories.length} categorii principale pentru vânzare,
              cumpărare, închiriere și schimb.
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <CategoryGrid />
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

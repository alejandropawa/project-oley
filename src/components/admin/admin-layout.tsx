import { AdminNav } from "@/components/admin/admin-nav";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function AdminLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background">
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
            <Breadcrumbs
              items={[{ label: "Acasă", href: "/" }, { label: "Admin" }]}
            />
            <div className="mt-8 max-w-3xl">
              <p className="text-sm font-bold uppercase text-primary">
                Admin TROKO
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-foreground sm:text-4xl min-[1800px]:text-5xl">
                {title}
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="mt-7">
              <AdminNav />
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

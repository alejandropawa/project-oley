import { AdminNav } from "@/components/admin/admin-nav";
import { SitePageShell } from "@/components/site/page-shell";
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
    <SitePageShell>
      <main className="relative isolate overflow-hidden">
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
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
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
            {children}
          </div>
        </section>
      </main>
    </SitePageShell>
  );
}

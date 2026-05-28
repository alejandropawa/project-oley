import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { cn } from "@/lib/utils";

export function SitePageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("min-h-screen overflow-x-hidden pb-20 md:pb-0", className)}
    >
      <Header />
      {children}
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export function SiteMain({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("relative isolate overflow-hidden", className)}>
      {children}
    </main>
  );
}

export function SiteContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-[1440px] px-5 pb-8 pt-8 sm:px-8 lg:px-10",
        className,
      )}
    >
      {children}
    </section>
  );
}

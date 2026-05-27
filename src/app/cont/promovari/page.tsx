import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Megaphone } from "lucide-react";

import {
  ActivePromotionCard,
  PromotionOrderCard,
} from "@/components/promotions/user-promotion-card";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/user";
import { isSupabaseConfigured } from "@/lib/db/env";
import {
  getUserListingPromotions,
  getUserPromotionOrders,
} from "@/lib/db/promotions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Promovările mele — TROKO",
  },
  description: "Istoricul solicitărilor și promovărilor active pe TROKO.",
};

export default async function AccountPromotionsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <AccountPromotionsFrame>
        <SetupState />
      </AccountPromotionsFrame>
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/cont/promovari");
  }

  const supabase = await createClient();
  const [ordersResult, promotionsResult] = await Promise.all([
    getUserPromotionOrders(user.id, supabase),
    getUserListingPromotions(user.id, supabase),
  ]);
  const activePromotions = promotionsResult.promotions.filter(
    (promotion) =>
      promotion.status === "active" || promotion.status === "scheduled",
  );
  const isUnavailable =
    ordersResult.source === "unavailable" &&
    promotionsResult.source === "unavailable";

  return (
    <AccountPromotionsFrame>
      {isUnavailable ? (
        <SetupState />
      ) : activePromotions.length === 0 && ordersResult.orders.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <section className="grid gap-4">
            <div>
              <p className="text-sm font-black uppercase text-primary">
                Vizibilitate curentă
              </p>
              <h2 className="mt-1 text-2xl font-black text-foreground">
                Promovări active
              </h2>
            </div>
            {activePromotions.length > 0 ? (
              <div className="grid gap-4">
                {activePromotions.map((promotion) => (
                  <ActivePromotionCard key={promotion.id} promotion={promotion} />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-border bg-card p-6 text-sm leading-6 text-muted-foreground shadow-soft-sm">
                Nu ai promovări active momentan.
              </div>
            )}
          </section>

          <section className="grid gap-4">
            <div>
              <p className="text-sm font-black uppercase text-primary">
                Solicitări
              </p>
              <h2 className="mt-1 text-2xl font-black text-foreground">
                Solicitări de promovare
              </h2>
            </div>
            {ordersResult.orders.length > 0 ? (
              <div className="grid gap-4">
                {ordersResult.orders.map((order) => (
                  <PromotionOrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-border bg-card p-6 text-sm leading-6 text-muted-foreground shadow-soft-sm">
                Nu ai trimis încă solicitări de promovare.
              </div>
            )}
          </section>
        </>
      )}
    </AccountPromotionsFrame>
  );
}

function AccountPromotionsFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background">
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Breadcrumbs
              items={[
                { label: "Acasă", href: "/" },
                { label: "Contul meu", href: "/cont" },
                { label: "Promovări" },
              ]}
            />
            <h1 className="mt-8 text-4xl font-black text-foreground sm:text-5xl">
              Promovările mele
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Urmărește solicitările trimise și promovările active pentru
              anunțurile tale.
            </p>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-border bg-card p-8 text-center shadow-soft-sm">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-primary">
        <Megaphone className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-2xl font-black text-foreground">
        Nu ai promovări încă
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Alege un anunț activ și trimite o solicitare de promovare. Activarea
        este manuală în această versiune.
      </p>
      <Button
        asChild
        className="mt-6 h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground"
      >
        <Link href="/cont/anunturi">Vezi anunțurile mele</Link>
      </Button>
    </div>
  );
}

function SetupState() {
  return (
    <div className="rounded-[1.75rem] border border-[#F3D88D] bg-[#FFF2CF] p-6 shadow-soft-sm">
      <h2 className="text-2xl font-black text-foreground">
        Promovările vor fi disponibile după configurarea Supabase.
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#7A5718]">
        Aplică migrarea pentru promovări și folosește un cont autentificat
        pentru a vedea solicitările reale.
      </p>
    </div>
  );
}

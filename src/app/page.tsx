import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MinimalLanding } from "@/components/home/minimal-landing";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

export const metadata: Metadata = {
  title: {
    absolute: "TROKO — Marketplace românesc pentru anunțuri",
  },
  description:
    "Caută și publică anunțuri pentru vânzare, cumpărare, închiriere și schimb pe TROKO.",
};

type HomeProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const query = await searchParams;
  const rawSearch = Array.isArray(query.q) ? query.q[0] : query.q;

  if (rawSearch !== undefined) {
    const trimmedSearch = rawSearch.trim();
    redirect(
      trimmedSearch
        ? `/anunturi?q=${encodeURIComponent(trimmedSearch)}`
        : "/anunturi",
    );
  }

  return (
    <>
      <Header />
      <main>
        <MinimalLanding />
      </main>
      <Footer />
    </>
  );
}

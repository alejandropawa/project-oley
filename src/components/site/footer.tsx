import Link from "next/link";
import { Camera, Play, Send, Video } from "lucide-react";

import {
  primaryActionButtonClassName,
  primaryActionIconClassName,
} from "@/components/ui/action-styles";
import { TrokoLogoLink } from "@/components/site/troko-logo-link";
import { cn } from "@/lib/utils";

const footerColumns = [
  {
    title: "TROKO",
    links: [
      { label: "Despre noi", href: "/despre" },
      { label: "Cum funcționează", href: "/siguranta" },
      { label: "Siguranță", href: "/siguranta" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Categorii populare",
    links: [
      { label: "Electronice", href: "/categorii/electronice" },
      { label: "Auto", href: "/categorii/auto" },
      { label: "Imobiliare", href: "/categorii/imobiliare" },
      { label: "Casă & grădină", href: "/categorii/casa-gradina" },
      { label: "Fashion", href: "/categorii/fashion" },
      { label: "Sport", href: "/categorii/sport" },
      { label: "Copii & bebe", href: "/categorii/copii-bebe" },
      { label: "Prestări Servicii", href: "/categorii/servicii" },
      { label: "Închirieri", href: "/categorii/inchirieri" },
      { label: "Schimburi", href: "/categorii/schimburi" },
    ],
  },
  {
    title: "Suport",
    links: [
      { label: "Întrebări frecvente", href: "/siguranta" },
      { label: "Reguli de publicare", href: "/siguranta" },
      { label: "Sfaturi pentru cumpărători", href: "/siguranta" },
      { label: "Sfaturi pentru vânzători", href: "/siguranta" },
      { label: "Raportează un anunț", href: "/siguranta" },
    ],
  },
  {
    title: "Contul tău",
    links: [
      { label: "Anunțurile mele", href: "/cont/anunturi" },
      { label: "Mesaje", href: "/mesaje" },
      { label: "Favorite", href: "/cont/favorite" },
      { label: "Căutări salvate", href: "/cont/cautari-salvate" },
      { label: "Notificări", href: "/notificari" },
    ],
  },
];

const legalLinks = [
  { label: "Termeni și condiții", href: "/termeni" },
  { label: "Confidențialitate", href: "/confidentialitate" },
  { label: "Cookies", href: "/cookies" },
  { label: "Politica de conținut interzis", href: "/siguranta" },
];

const socialLinks = [
  { label: "Facebook", content: "f" },
  { label: "Instagram", icon: Camera },
  { label: "YouTube", icon: Video },
  { label: "TikTok", icon: Play },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="siteFooter isolate overflow-visible text-brand-ink">
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-8 pt-20 sm:px-8 sm:pt-24 lg:px-10 lg:pb-10 lg:pt-28">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_2.85fr_1.35fr] lg:gap-12">
          <section aria-label="Despre TROKO" className="max-w-sm">
            <TrokoLogoLink />
            <p className="mt-5 max-w-xs text-sm leading-6 text-brand-muted">
              Marketplace-ul românesc pentru vânzare, cumpărare, închiriere și
              schimb.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = "icon" in social ? social.icon : null;

                return (
                  <Link
                    key={social.label}
                    href="/"
                    aria-label={social.label}
                    className="grid size-10 place-items-center rounded-full border border-border bg-card/75 text-brand shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:bg-white"
                  >
                    {Icon ? (
                      <Icon className="size-4" aria-hidden="true" />
                    ) : (
                      <span className="text-base font-semibold" aria-hidden="true">
                        {social.content}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>

          <nav
            aria-label="Linkuri footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:gap-10"
          >
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="text-xs font-semibold uppercase tracking-normal text-brand">
                  {column.title}
                </h2>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-brand-muted transition-colors hover:text-brand"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <section aria-labelledby="footer-newsletter">
            <h2
              id="footer-newsletter"
              className="text-xs font-semibold uppercase tracking-normal text-brand"
            >
              Fii la curent
            </h2>
            <p className="mt-5 text-sm leading-6 text-brand-muted">
              Abonează-te la noutăți și sfaturi utile din lumea anunțurilor.
            </p>
            <form className="mt-5 space-y-3" aria-label="Abonare newsletter">
              <label htmlFor="footer-email" className="sr-only">
                Emailul tău
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Emailul tău"
                className="h-12 w-full rounded-full border border-border bg-card/82 px-5 text-sm text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand focus:ring-3 focus:ring-brand/20"
              />
              <button
                type="button"
                className={cn(
                  primaryActionButtonClassName,
                  "inline-flex h-12 w-full items-center justify-center gap-3 px-5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-3",
                )}
              >
                Abonează-te
                <Send
                  className={cn("size-4", primaryActionIconClassName)}
                  aria-hidden="true"
                />
              </button>
            </form>
          </section>
        </div>

        <div className="mt-12 pt-6">
          <div className="mx-auto h-px w-2/5 bg-border" />
          <div className="mt-6 flex flex-col items-center gap-4 text-center">
            <nav
              aria-label="Linkuri legale"
              className="flex flex-wrap justify-center gap-x-6 gap-y-2"
            >
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-medium text-brand-ink transition-colors hover:text-brand"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <p className="text-xs text-brand-muted">
              © {currentYear} TROKO.ro - Toate drepturile rezervate.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

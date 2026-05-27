import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { indexRobots, metadataBase } from "@/lib/seo/metadata";
import {
  DEFAULT_SEO_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  defaultOgImageUrl,
} from "@/lib/seo/site";
import { PreloadResources } from "./preload-resources";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  preload: false,
  subsets: ["latin", "latin-ext"],
});

const defaultTitle =
  "TROKO — Marketplace-ul românesc pentru vânzare, cumpărare, închiriere și schimb";

export const metadata: Metadata = {
  title: {
    template: "%s | TROKO",
    default: defaultTitle,
  },
  description: DEFAULT_SEO_DESCRIPTION,
  metadataBase: metadataBase(),
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: SITE_NAME,
    title: defaultTitle,
    description: DEFAULT_SEO_DESCRIPTION,
    url: absoluteUrl("/"),
    images: [
      {
        url: defaultOgImageUrl(),
        width: 1200,
        height: 630,
        alt: "TROKO marketplace românesc pentru anunțuri locale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: DEFAULT_SEO_DESCRIPTION,
    images: [defaultOgImageUrl()],
  },
  robots: indexRobots,
};

export const viewport: Viewport = {
  themeColor: "#2F6F65",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <div className="appBackground">
          <PreloadResources />
          <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
          <div className="appContent">{children}</div>
        </div>
      </body>
    </html>
  );
}

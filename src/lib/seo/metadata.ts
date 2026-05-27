import type { Metadata } from "next";

import {
  DEFAULT_SEO_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  defaultOgImageUrl,
  getSiteUrl,
} from "@/lib/seo/site";

export const noIndexRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

export const indexRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
  },
};

export function createPublicMetadata({
  title,
  description = DEFAULT_SEO_DESCRIPTION,
  path = "/",
  image,
  type = "website",
  robots = indexRobots,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  robots?: Metadata["robots"];
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = image ?? defaultOgImageUrl();

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type,
      locale: "ro_RO",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} marketplace românesc`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots,
  };
}

export function createNoIndexMetadata({
  title,
  description,
}: {
  title: string;
  description?: string;
}): Metadata {
  return {
    title,
    description,
    robots: noIndexRobots,
  };
}

export function metadataBase() {
  return new URL(getSiteUrl());
}

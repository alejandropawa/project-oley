export const SITE_NAME = "TROKO";

export const DEFAULT_SITE_URL = "https://troko.ro";

export const DEFAULT_SEO_DESCRIPTION =
  "Publică, găsește și negociază anunțuri locale pe TROKO. Vânzare, cumpărare, închiriere și schimb în România.";

export const SHORT_SEO_DESCRIPTION =
  "Marketplace românesc pentru vânzare, cumpărare, închiriere și schimb.";

export const DEFAULT_OG_IMAGE_PATH = "/opengraph-image";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return stripTrailingSlash(configuredUrl);
  }

  if (process.env.NODE_ENV === "production") {
    return DEFAULT_SITE_URL;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  const siteUrl = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${siteUrl}${cleanPath}`;
}

export function defaultOgImageUrl() {
  return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
}

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

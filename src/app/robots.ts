import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/cont",
        "/cont/",
        "/notificari",
        "/notificari/",
        "/mesaje",
        "/mesaje/",
        "/admin",
        "/admin/",
        "/auth/",
        "/onboarding",
        "/login",
        "/autentificare",
        "/inregistrare",
        "/register",
        "/resetare-parola",
        "/actualizeaza-parola",
        "/anunturi?*",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

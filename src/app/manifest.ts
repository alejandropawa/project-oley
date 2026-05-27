import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TROKO",
    short_name: "TROKO",
    description:
      "Marketplace românesc pentru vânzare, cumpărare, închiriere și schimb.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F3EE",
    theme_color: "#2F6F65",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

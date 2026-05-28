import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TROKO",
    short_name: "TROKO",
    description:
      "Marketplace românesc pentru vânzare, cumpărare, închiriere și schimb.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFEFC",
    theme_color: "#005F3F",
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

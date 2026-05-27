import type { ReactNode } from "react";

import { createPublicMetadata } from "@/lib/seo/metadata";

const publishMetadata = createPublicMetadata({
  title: "Publică anunț pe TROKO",
  description:
    "Creează rapid un anunț pentru vânzare, cumpărare, închiriere sau schimb.",
  path: "/publica",
});

export const metadata = {
  ...publishMetadata,
  title: {
    template: "%s",
    default: "Publică anunț pe TROKO",
  },
};

export default function PublishLayout({ children }: { children: ReactNode }) {
  return children;
}

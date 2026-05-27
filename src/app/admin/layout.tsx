import type { ReactNode } from "react";

import { noIndexRobots } from "@/lib/seo/metadata";

export const metadata = {
  title: {
    template: "%s",
    default: "TROKO",
  },
  robots: noIndexRobots,
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}

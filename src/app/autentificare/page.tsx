import { redirect } from "next/navigation";

import { getAuthDrawerPath } from "@/lib/auth/redirect";

export default async function AutentificarePage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawRedirectTo = Array.isArray(params.redirectTo)
    ? params.redirectTo[0]
    : params.redirectTo;

  redirect(getAuthDrawerPath("login", rawRedirectTo));
}

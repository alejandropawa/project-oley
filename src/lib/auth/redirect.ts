export function getSafeRedirectPath(value: string | null | undefined) {
  if (!value) {
    return "/cont";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/cont";
  }

  try {
    const parsed = new URL(value, "https://troko.local");

    if (parsed.origin !== "https://troko.local") {
      return "/cont";
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/cont";
  }
}

export function getAuthDrawerPath(
  mode: "login" | "register",
  redirectTo?: string | null,
) {
  const params = new URLSearchParams({ auth: mode });

  if (redirectTo) {
    params.set("redirectTo", getSafeRedirectPath(redirectTo));
  }

  return `/?${params.toString()}`;
}

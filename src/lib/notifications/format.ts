export function safeNotificationPreview(value: string, maxLength = 140) {
  const clean = value.replace(/\s+/g, " ").trim();

  if (clean.length <= maxLength) {
    return clean;
  }

  return `${clean.slice(0, maxLength - 1).trim()}…`;
}

export function isSafeInternalPath(value: string | null | undefined) {
  if (!value) {
    return true;
  }

  return value.startsWith("/") && !value.startsWith("//") && !value.includes("://");
}

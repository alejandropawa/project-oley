export const AUTH_FIELD_LIMITS = {
  // Keep these client-side limits aligned with backend/Supabase constraints.
  name: {
    min: 2,
    max: 80,
  },
  email: {
    max: 254,
  },
  password: {
    min: 8,
    max: 128,
  },
} as const;

export const AUTH_SUBMIT_COOLDOWN_MS = 1200;
export const AUTH_TERMS_VERSION = "2026-05-28";
export const AUTH_PRIVACY_VERSION = "2026-05-28";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHARACTERS_PATTERN = /[\u0000-\u001F\u007F]/g;
const WHITESPACE_PATTERN = /\s+/g;

export function getAuthErrorMessage(message?: string) {
  if (!message) {
    return "A apărut o eroare. Vă rugăm să încercați din nou.";
  }

  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Emailul sau parola introduse nu sunt corecte.";
  }

  if (lower.includes("email not confirmed")) {
    return "Confirmarea emailului este necesară înainte de autentificare.";
  }

  if (lower.includes("user already registered")) {
    return "Există deja un cont asociat acestui email.";
  }

  if (lower.includes("database error saving new user")) {
    return "Contul nu a putut fi creat din cauza unei configurări temporare a serviciului. Vă rugăm să încercați din nou mai târziu.";
  }

  if (lower.includes("password")) {
    return "Parola introdusă nu respectă cerințele de securitate.";
  }

  return "Acțiunea nu a putut fi finalizată. Verificați datele și încercați din nou.";
}

export function isValidEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  return (
    normalizedEmail.length <= AUTH_FIELD_LIMITS.email.max &&
    EMAIL_PATTERN.test(normalizedEmail)
  );
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeName(name: string) {
  return name
    .replace(CONTROL_CHARACTERS_PATTERN, "")
    .replace(WHITESPACE_PATTERN, " ")
    .trim();
}

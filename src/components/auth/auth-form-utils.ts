export function getAuthErrorMessage(message?: string) {
  if (!message) {
    return "A apărut o eroare. Încearcă din nou.";
  }

  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Emailul sau parola nu sunt corecte.";
  }

  if (lower.includes("email not confirmed")) {
    return "Confirmă emailul înainte de autentificare.";
  }

  if (lower.includes("user already registered")) {
    return "Există deja un cont cu acest email.";
  }

  if (lower.includes("password")) {
    return "Verifică parola introdusă și încearcă din nou.";
  }

  return "Nu am putut finaliza acțiunea. Verifică datele și încearcă din nou.";
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

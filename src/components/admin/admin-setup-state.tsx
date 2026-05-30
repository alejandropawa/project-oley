export function AdminSetupState({
  title = "Admin dashboard-ul va fi disponibil după configurarea Supabase.",
  description = "Aplică migrarea de moderare și adaugă primul admin în tabela admin_users.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-warm/45 bg-secondary p-6 shadow-soft-sm">
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-warm-foreground">{description}</p>
    </div>
  );
}

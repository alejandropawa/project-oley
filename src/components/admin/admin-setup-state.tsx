export function AdminSetupState({
  title = "Admin dashboard-ul va fi disponibil după configurarea Supabase.",
  description = "Aplică migrarea de moderare și adaugă primul admin în tabela admin_users.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-[#F3D88D] bg-[#FFF2CF] p-6 shadow-soft-sm">
      <h2 className="text-2xl font-black text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#7A5718]">{description}</p>
    </div>
  );
}

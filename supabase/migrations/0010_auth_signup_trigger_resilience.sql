create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
  next_slug text;
  accepted_at timestamptz;
  terms_version text;
  privacy_version text;
begin
  display_name := public.normalize_auth_name(new.raw_user_meta_data->>'full_name');
  accepted_at := coalesce(new.created_at, now());
  terms_version := left(coalesce(nullif(new.raw_user_meta_data->>'termsVersion', ''), '2026-05-28'), 64);
  privacy_version := left(coalesce(nullif(new.raw_user_meta_data->>'privacyVersion', ''), '2026-05-28'), 64);
  next_slug := public.profile_slug_from_name(coalesce(display_name, split_part(new.email, '@', 1), 'utilizator-troko'), new.id);

  begin
    insert into public.profiles (
      id,
      display_name,
      slug,
      email_verified_at
    )
    values (
      new.id,
      display_name,
      next_slug,
      case when new.email_confirmed_at is not null then new.email_confirmed_at else null end
    )
    on conflict (id) do update
    set display_name = coalesce(public.profiles.display_name, excluded.display_name),
        slug = coalesce(public.profiles.slug, excluded.slug),
        email_verified_at = coalesce(public.profiles.email_verified_at, excluded.email_verified_at);
  exception
    when others then
      raise warning 'Troko signup profile bootstrap failed for user %: %', new.id, sqlerrm;
  end;

  begin
    insert into public.profile_private_settings (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  exception
    when others then
      raise warning 'Troko signup private settings bootstrap failed for user %: %', new.id, sqlerrm;
  end;

  begin
    insert into public.notification_preferences (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  exception
    when others then
      raise warning 'Troko signup notification preferences bootstrap failed for user %: %', new.id, sqlerrm;
  end;

  begin
    insert into public.user_trust_badges (user_id, badge, label, description)
    values (
      new.id,
      'new_member',
      'Membru nou',
      'Utilizator nou pe TROKO.'
    )
    on conflict (user_id, badge) do nothing;
  exception
    when others then
      raise warning 'Troko signup trust badge bootstrap failed for user %: %', new.id, sqlerrm;
  end;

  begin
    insert into public.user_legal_acceptances (
      user_id,
      terms_version,
      privacy_version,
      accepted_terms_at,
      acknowledged_privacy_at,
      source
    )
    values (
      new.id,
      terms_version,
      privacy_version,
      accepted_at,
      accepted_at,
      'auth_register'
    )
    on conflict (user_id, terms_version, privacy_version, source) do nothing;
  exception
    when others then
      raise warning 'Troko signup legal acceptance bootstrap failed for user %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

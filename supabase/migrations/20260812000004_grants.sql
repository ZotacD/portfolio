-- Droits des rôles API (Supabase « always revoked » par défaut).
-- Sans ces GRANTs, anon/authenticated/service_role n'ont aucun accès aux tables.

alter default privileges in schema public
  grant all on tables to service_role;

alter default privileges in schema public
  grant select on tables to anon, authenticated;

grant all on public.projects, public.project_files, public.project_images, public.profile
  to service_role;

grant select on public.projects, public.project_files, public.project_images, public.profile
  to anon, authenticated;

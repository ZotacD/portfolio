-- Lien externe d'un projet (démo, dépôt GitHub…)

alter table public.projects
  add column link_url text;

-- Galerie photo des projets (plusieurs images par projet)

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null,      -- chemin dans le bucket
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.project_images enable row level security;

-- Lecture publique des images rattachées à un projet publié
create policy "project_images_public_select"
  on public.project_images for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

-- Upload / suppression : uniquement service_role (aucune politique publique).

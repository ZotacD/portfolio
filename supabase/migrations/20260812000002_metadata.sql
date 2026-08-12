-- Tables métier du portfolio

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  description text,
  cover_url text,
  tags text[] default '{}',
  status text not null default 'draft', -- draft | published
  sort_order int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  storage_path text not null,      -- chemin dans le bucket
  mime_type text,
  size bigint,
  created_at timestamptz not null default now()
);

create table public.profile (
  id int primary key default 1 check (id = 1), -- ligne unique
  name text,
  title text,
  bio text,
  email text,
  phone text,
  location text,
  social jsonb default '{}',
  updated_at timestamptz not null default now()
);

-- ---------- Triggers updated_at ----------

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger profile_updated_at
  before update on public.profile
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------

alter table public.projects enable row level security;
alter table public.project_files enable row level security;
alter table public.profile enable row level security;

-- Lecture publique : uniquement les projets publiés
create policy "projects_public_select"
  on public.projects for select
  using (status = 'published');

-- Lecture publique des fichiers rattachés à un projet publié
create policy "project_files_public_select"
  on public.project_files for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

-- Lecture publique du profil
create policy "profile_public_select"
  on public.profile for select
  using (true);

-- Les écritures se font UNIQUEMENT côté serveur avec la clé service_role
-- (contourne la RLS) : aucune politique d'insertion/mise à jour/suppression
-- n'est créée pour les rôles anon/authenticated.

-- ---------- Bucket Storage ----------

insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', true)
on conflict (id) do nothing;

create policy "public_read_project_files"
  on storage.objects for select
  using (bucket_id = 'project-files');

-- Upload / suppression : uniquement service_role (aucune politique publique).

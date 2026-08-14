-- Bucket Storage (Supabase Storage) — provisionné au démarrage de la stack.
-- Le schéma des tables est géré par Prisma (prisma/migrations) et non ici.

insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', true)
on conflict (id) do nothing;

drop policy if exists "public_read_project_files" on storage.objects;

create policy "public_read_project_files"
  on storage.objects for select
  using (bucket_id = 'project-files');

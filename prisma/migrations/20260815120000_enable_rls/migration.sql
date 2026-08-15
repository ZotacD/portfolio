-- Active la RLS (Row Level Security) sur toutes les tables : accès Data API
-- refusé par défaut aux rôles anon/authenticated. Le rôle `postgres` (utilisé
-- par Prisma) contourne la RLS, l'application n'est donc pas affectée.

alter table "user" enable row level security;
alter table "session" enable row level security;
alter table "account" enable row level security;
alter table "verification" enable row level security;
alter table "projects" enable row level security;
alter table "project_files" enable row level security;
alter table "project_images" enable row level security;
alter table "profile" enable row level security;
alter table "contact_messages" enable row level security;

-- Active automatiquement la RLS sur toute FUTURE table du schéma public.
create or replace function public.enable_rls_on_new_table()
returns event_trigger
language plpgsql
as $$
declare
  r record;
begin
  for r in
    select * from pg_event_trigger_ddl_commands()
    where command_tag = 'CREATE TABLE'
      and schema_name = 'public'
  loop
    execute format('alter table %s enable row level security', r.object_identity);
  end loop;
end;
$$;

create event trigger trg_enable_rls_public
  on ddl_command_end
  when tag in ('CREATE TABLE')
  execute function public.enable_rls_on_new_table();

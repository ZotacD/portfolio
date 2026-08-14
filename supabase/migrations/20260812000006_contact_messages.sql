-- Messages de contact envoyés depuis la page /contact.

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Accès réservé au service_role (dashboard admin). Aucune politique publique :
-- les messages sont privés, ils ne sont lisibles que via le dashboard.
grant all on public.contact_messages to service_role;
revoke all on public.contact_messages from anon, authenticated;

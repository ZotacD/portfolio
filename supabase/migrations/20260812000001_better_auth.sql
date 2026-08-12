-- Better Auth — tables d'authentification (adaptateur Kysely)
--
-- NB : l'adaptateur Kysely de Better Auth utilise les noms de modèles par
-- défaut (user / session / account / verification) comme noms de tables
-- réels. Les colonnes, en revanche, sont mappées via l'option `schema`
-- (camelCase -> snake_case dans src/lib/auth.ts).

create table public."user" (
  id text primary key,
  name text not null,
  email text not null unique,
  email_verified boolean not null default false,
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public."session" (
  id text primary key,
  expires_at timestamptz not null,
  token text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  user_id text not null references public."user"(id) on delete cascade
);

create table public."account" (
  id text primary key,
  account_id text not null,
  provider_id text not null,
  user_id text not null references public."user"(id) on delete cascade,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scope text,
  password text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public."verification" (
  id text primary key,
  identifier text not null,
  value text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security : les accès passent par la connexion service_role
-- (contourne la RLS) pour les écritures et les lectures de session.
alter table public."user" enable row level security;
alter table public."session" enable row level security;
alter table public."account" enable row level security;
alter table public."verification" enable row level security;

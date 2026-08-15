# Portfolio

Portfolio personnel (site public en français) + dashboard d'administration, basé sur Next.js 15, shadcn/ui, Supabase et Better Auth.

## Stack

- Next.js 15 (App Router) + TypeScript strict + Tailwind CSS
- shadcn/ui (Radix)
- **Prisma** (Postgres : schéma + accès aux données) — source de vérité `prisma/schema.prisma`
- Supabase : **Storage uniquement** (fichiers / images) + hébergement de la base Postgres
- Better Auth (email/mot de passe, un seul admin) via l'adaptateur Prisma
- Zod pour la validation, Server Actions pour les mutations

## Démarrage en local

### Prérequis

- Node.js ≥ 20, pnpm
- Docker Desktop (lancé)

### 1. Variables d'environnement

```bash
cp .env.example .env.local   # variables de l'application (Next.js)
```

Renseigner dans `.env.local` :

- `NEXT_PUBLIC_SUPABASE_URL` : `http://127.0.0.1:54321` (par défaut)
- `SUPABASE_SERVICE_ROLE_KEY` : clé `service_role` (Storage uniquement)
- `DATABASE_URL` : `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- `BETTER_AUTH_SECRET` : générer via `openssl rand -base64 32`
- `BETTER_AUTH_URL` : `http://localhost:3000`
- `NEXT_PUBLIC_SITE_URL` : `http://localhost:3000`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` (mot de passe ≥ 8 caractères)

> La CLI Prisma lit `DATABASE_URL` depuis le fichier `.env`. Crée-le si besoin :
> `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres`

> La clé `anon` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) n'est plus nécessaire : l'application
> ne lit plus via la Data API, tout passe par Prisma.

### 2. Démarrer Supabase (Postgres + Storage, via Docker)

```bash
pnpm db:start
```

### 3. Appliquer les migrations Prisma

```bash
pnpm db:migrate:local
# ou pour repartir de zéro (reset Supabase + migrations Prisma) :
pnpm db:reset:local
```

### 4. Créer le compte administrateur

```bash
pnpm db:admin:local
```

Un seul compte est autorisé (l'adresse `ADMIN_EMAIL`).

### 5. Lancer l'application

```bash
pnpm dev
```

- Site public : http://localhost:3000
- Connexion admin : http://localhost:3000/login
- Dashboard : http://localhost:3000/admin
- Studio Supabase (DB, Storage) : http://127.0.0.1:54323

## Scripts utiles

| Commande                     | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| `pnpm dev`                   | Serveur de développement                               |
| `pnpm build`                 | Build de production                                    |
| `pnpm lint`                  | Lint ESLint                                            |
| `pnpm db:start`              | Démarre la stack Supabase locale (Docker)              |
| `pnpm db:stop`               | Arrête la stack locale                                 |
| `pnpm db:status`             | Affiche les clés/URLs locales                          |
| `pnpm db:generate`           | Régénère le client Prisma                              |
| `pnpm db:migrate:local`      | Applique les migrations Prisma en local                |
| `pnpm db:migrate:prod`       | Applique les migrations Prisma en prod (`.env.prod`)   |
| `pnpm db:migrate:status:local` | État des migrations (local)                          |
| `pnpm db:migrate:status:prod`  | État des migrations (prod)                           |
| `pnpm db:reset:local`        | Reset local (Supabase + Prisma)                        |
| `pnpm db:reset:prod`         | Reset prod — ⚠️ destructif                             |
| `pnpm db:admin:local`        | Crée le compte admin (local)                           |
| `pnpm db:admin:prod`         | Crée le compte admin (prod)                            |
| `pnpm db:seed:demo`          | Charge les données de démonstration                    |

## Migrations

- Les migrations se trouvent dans **`prisma/migrations/`** (gérées par Prisma Migrate).
- Le bucket Storage `project-files` est créé par `supabase/migrations/20260812000001_storage_bucket.sql`.
- La **RLS est activée par défaut** sur toutes les tables (event trigger `trg_enable_rls_public`) :
  accès Data API refusé aux rôles `anon`/`authenticated`, sans impact sur l'application
  (Prisma se connecte en rôle `postgres`, qui contourne la RLS).

Pour faire évoluer le schéma :

1. Modifier `prisma/schema.prisma`.
2. `pnpm db:generate` puis `pnpm db:migrate:local` (génère + applique en local).
3. Commit la migration, puis `pnpm db:migrate:prod`.

## Déploiement (Vercel)

1. Créer un projet Supabase cloud, puis appliquer le schéma en prod :
   ```bash
   # une fois (baseline) : marquer le schéma existant comme appliqué
   pnpm exec dotenv -e .env.prod -- prisma migrate resolve --applied 20260812000000_init
   # ou reset propre (⚠️ destructif) :
   pnpm db:reset:prod
   ```
2. Configurer les variables d'environnement dans Vercel (voir `.env.example`).
   Pour `DATABASE_URL`, utiliser la **session pooler (port 5432)**.
3. Créer le compte admin : `pnpm db:admin:prod`.

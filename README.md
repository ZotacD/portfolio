# Portfolio

Portfolio personnel (site public en français) + dashboard d'administration, basé sur Next.js 15, shadcn/ui, Supabase et Better Auth.

## Stack

- Next.js 15 (App Router) + TypeScript strict + Tailwind CSS
- shadcn/ui (Radix)
- Supabase : Postgres (données) + Storage (fichiers / images)
- Better Auth (email/mot de passe, un seul admin) via adaptateur Kysely
- Zod pour la validation, Server Actions pour les mutations

## Démarrage en local

### Prérequis

- Node.js ≥ 20, pnpm
- Docker Desktop (lancé)

### 1. Variables d'environnement

```bash
cp .env.example .env.local
```

Renseigner ensuite les valeurs (voir les instructions ci-dessous).

### 2. Démarrer Supabase (local, via Docker)

```bash
pnpm db:start
```

Les migrations sont appliquées automatiquement au premier démarrage.
Pour appliquer explicitement les migrations sur la base locale :

```bash
pnpm db:migrate
# ou pour repartir de zéro (applique toutes les migrations + le seed) :
pnpm db:reset
```

### 3. Récupérer les clés Supabase

```bash
pnpm db:status
```

Renseigner dans `.env.local` :

- `NEXT_PUBLIC_SUPABASE_URL` : `http://127.0.0.1:54321` (par défaut)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : clé `anon`
- `SUPABASE_SERVICE_ROLE_KEY` : clé `service_role`
- `DATABASE_URL` : `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

Générer un secret Better Auth : `openssl rand -base64 32` → `BETTER_AUTH_SECRET`.

Renseigner `ADMIN_EMAIL` et `ADMIN_PASSWORD` (mot de passe ≥ 8 caractères).

### 4. Créer le compte administrateur

```bash
pnpm db:admin
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

| Commande             | Description                                  |
| -------------------- | -------------------------------------------- |
| `pnpm dev`           | Serveur de développement                      |
| `pnpm build`         | Build de production                          |
| `pnpm lint`          | Lint ESLint                                  |
| `pnpm db:start`      | Démarre la stack Supabase locale (Docker)     |
| `pnpm db:stop`       | Arrête la stack locale                       |
| `pnpm db:reset`      | Réinitialise la base et applique migrations + seed |
| `pnpm db:migrate`    | Applique les migrations en attente            |
| `pnpm db:status`     | Affiche les clés/URLs locales                 |
| `pnpm db:admin`      | Crée le compte administrateur                 |

## Migrations

Les migrations SQL se trouvent dans `supabase/migrations/` (nomenclature
horodatée Supabase). Le seed (`supabase/seed.sql`) initialise la ligne `profile` (id = 1).

## Déploiement (Vercel)

1. Créer un projet Supabase cloud et exécuter les migrations (`supabase db push` après `supabase link`, ou copier les fichiers dans le SQL Editor).
2. Configurer les variables d'environnement dans Vercel (voir `.env.example`).
3. Créer le compte admin (via un script équivalent à `pnpm db:admin` sur l'environnement de production).

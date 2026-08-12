/**
 * Seed de démonstration — remplit la base locale avec de fausses données
 * pour tester toutes les fonctionnalités.
 *
 * Usage : pnpm db:seed:demo
 * Prérequis : stack Supabase locale démarrée, serveur dev lancé (pnpm dev),
 * .env.local renseigné.
 */
import dotenv from "dotenv";
import { deflateSync } from "node:zlib";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });

const BASE = "http://localhost:3000";

// ---------- Mini générateur PNG (couleur unie) ----------

function crc32(buf: Buffer): number {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function makePng(width: number, height: number, [r, g, b]: [number, number, number]): Buffer {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  const row = Buffer.alloc(1 + width * 3);
  for (let x = 0; x < width; x++) {
    row[1 + x * 3] = r;
    row[2 + x * 3] = g;
    row[3 + x * 3] = b;
  }
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------- Helpers ----------

function getCookie(res: Response): string {
  const values =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [res.headers.get("set-cookie")].filter(Boolean);
  return values[0] ? values[0].split(";")[0] : "";
}

async function uploadFile(
  cookie: string,
  purpose: "files" | "gallery" | "covers",
  projectId: string | undefined,
  fileName: string,
  buffer: Buffer,
  mimeType: string
) {
  const formData = new FormData();
  formData.set("purpose", purpose);
  if (projectId) formData.set("projectId", projectId);
  formData.append("files", new Blob([new Uint8Array(buffer)], { type: mimeType }), fileName);
  const res = await fetch(`${BASE}/api/admin/upload`, {
    method: "POST",
    headers: { Cookie: cookie, Origin: BASE },
    body: formData,
  });
  return res.json();
}

// ---------- Données ----------

const COLORS: [number, number, number][] = [
  [99, 102, 241], // indigo
  [139, 92, 246], // violet
  [59, 130, 246], // bleu
  [16, 185, 129], // émeraude
  [245, 158, 11], // ambre
  [236, 72, 153], // rose
  [14, 165, 233], // ciel
  [234, 88, 12],  // orange
];

interface SeedProject {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  tags: string[];
  status: "published" | "draft";
  sort_order: number;
  link_url: string | null;
  gallery: number;
  files: { name: string; content: string }[];
}

const SEED_PROJECTS: SeedProject[] = [
  {
    slug: "portfolio-personnel",
    title: "Portfolio personnel",
    excerpt:
      "Un portfolio moderne construit avec Next.js, Tailwind CSS et Supabase.",
    description: `## Contexte

Ce portfolio a été conçu pour présenter mes projets de manière claire et moderne.

## Fonctionnalités

- Site public **statique** et optimisé pour le SEO
- **Dashboard d'administration** avec gestion des projets
- Galerie de photos et fichiers téléchargeables
- Formulaire de contact fonctionnel

## Stack technique

- **Next.js 15** (App Router)
- **Tailwind CSS** + shadcn/ui
- **Supabase** (Postgres, Storage, Auth)
- Déployé sur Vercel

\`\`\`bash
pnpm install
pnpm dev
\`\`\`
`,
    tags: ["next.js", "tailwind", "supabase", "typescript"],
    status: "published",
    sort_order: 1,
    link_url: "https://github.com/example/portfolio",
    gallery: 4,
    files: [
      {
        name: "presentation-portfolio.txt",
        content:
          "Présentation du projet portfolio.\n\nConçu en Next.js 15 avec Supabase.\n\nContacts : voir la page contact.",
      },
    ],
  },
  {
    slug: "gestion-taches",
    title: "Application de gestion de tâches",
    excerpt:
      "Une application collaborative de gestion de tâches avec synchronisation en temps réel.",
    description: `## Objectif

Simplifier la gestion de projets en équipe avec un outil léger.

## Points forts

- Tableaux **Kanban** et listes
- Assignation des membres et notifications
- Mode hors-ligne avec synchronisation

## Technologies

- **React** + TypeScript
- **Supabase** Realtime
- **Tailwind CSS**
`,
    tags: ["react", "typescript", "supabase"],
    status: "published",
    sort_order: 2,
    link_url: "https://demo-taches.example.com",
    gallery: 3,
    files: [],
  },
  {
    slug: "site-vitrine-boulangerie",
    title: "Site vitrine — Boulangerie",
    excerpt:
      "Un site vitrine élégant pour une boulangerie artisanale, avec menu et horaires.",
    description: `## Le projet

Refonte complète du site d'une boulangerie artisanale.

## Contenu

- Présentation de l'équipe et des valeurs
- Menu et tarifs
- Horaires et localisation
- Formulaire de contact

## Réalisations

- Design **responsive** et accessible
- Performance au chargement optimisée
`,
    tags: ["design", "next.js", "seo"],
    status: "published",
    sort_order: 3,
    link_url: null,
    gallery: 3,
    files: [],
  },
  {
    slug: "dashboard-analytics",
    title: "Dashboard analytics temps réel",
    excerpt:
      "Un tableau de bord d'analytics avec graphiques temps réel et alertes.",
    description: `## Description

Un dashboard d'analytics pour visualiser les données produit en temps réel.

## Fonctionnalités

- Graphiques **interactifs**
- Filtres par période et segment
- Alertes configurées par email

## Stack

- **Next.js** + Recharts
- **Supabase** Realtime
- API REST documentée
`,
    tags: ["react", "recharts", "supabase", "data"],
    status: "published",
    sort_order: 4,
    link_url: "https://github.com/example/dashboard-analytics",
    gallery: 2,
    files: [
      {
        name: "rapport-mensuel.txt",
        content:
          "Rapport mensuel d'utilisation.\n\nVisiteurs : 12 400\nTaux de conversion : 3,2 %\nTemps moyen : 4 min 12 s",
      },
    ],
  },
  {
    slug: "bot-discord",
    title: "Bot Discord communautaire",
    excerpt:
      "Un bot Discord de modération et de jeux pour une communauté de 20 000 membres.",
    description: `## Présentation

Un bot Discord développé pour la communauté.

## Modules

- **Modération** (auto-modération, sanctions)
- **Jeux** et classements
- Commandes personnalisées

## Technique

- **Node.js** et TypeScript
- Base de données **Postgres**
`,
    tags: ["node.js", "typescript", "api"],
    status: "published",
    sort_order: 5,
    link_url: null,
    gallery: 2,
    files: [],
  },
  {
    slug: "api-reservation",
    title: "API de réservation",
    excerpt:
      "Une API REST de réservation avec authentification et gestion des créneaux.",
    description: `## Contexte

API de réservation pour un réseau de salles.

## Endpoints

- \`POST /reservations\`
- \`GET /reservations/:id\`
- \`PATCH /reservations/:id\`

## Sécurité

- **JWT** et rôles
- Validation Zod
- Rate limiting
`,
    tags: ["api", "node.js", "zod", "docker"],
    status: "draft",
    sort_order: 6,
    link_url: null,
    gallery: 0,
    files: [],
  },
  {
    slug: "landing-page-startup",
    title: "Landing page — Startup",
    excerpt:
      "Une landing page à fort taux de conversion pour le lancement d'une startup.",
    description: `## Le défi

Créer une landing page qui convertit.

## Approche

- Message clair et **CTA** bien placés
- Preuves sociales et témoignages
- Animations légères

## Résultat

- +40 % d'inscriptions en un mois
`,
    tags: ["design", "next.js", "marketing"],
    status: "draft",
    sort_order: 7,
    link_url: null,
    gallery: 0,
    files: [],
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD requis dans .env.local.");
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL requise dans .env.local.");

  // Session admin (pour les uploads)
  const signIn = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE },
    body: JSON.stringify({ email, password }),
  });
  if (signIn.status !== 200) {
    throw new Error(`Connexion admin impossible (${signIn.status}).`);
  }
  const cookie = getCookie(signIn);

  const pool = new Pool({ connectionString: databaseUrl });

  // Nettoyage des données de démo existantes
  await pool.query("delete from project_images");
  await pool.query("delete from project_files");
  await pool.query("delete from projects");

  // Profil
  await pool.query(
    `insert into profile (id, name, title, bio, email, phone, location, social, updated_at)
     values (1, $1, $2, $3, $4, $5, $6, $7, now())
     on conflict (id) do update set
       name = excluded.name, title = excluded.title, bio = excluded.bio,
       email = excluded.email, phone = excluded.phone, location = excluded.location,
       social = excluded.social, updated_at = now()`,
    [
      "Thomas Delangle",
      "Développeur Full-Stack",
      "Je conçois des applications web modernes et performantes. Passionné par l'open source et le design soigné, j'accompagne des projets de l'idée à la mise en production.",
      email,
      "+33 6 12 34 56 78",
      "Lyon, France",
      JSON.stringify({
        github: "https://github.com/example",
        linkedin: "https://linkedin.com/in/example",
        twitter: "https://x.com/example",
      }),
    ]
  );
  console.log("✓ Profil rempli");

  let colorIndex = 0;
  let totalImages = 0;
  let totalFiles = 0;

  for (const seed of SEED_PROJECTS) {
    const publishedAt =
      seed.status === "published" ? new Date().toISOString() : null;

    const { rows } = await pool.query(
      `insert into projects (slug, title, excerpt, description, tags, status, sort_order, published_at, link_url)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id`,
      [
        seed.slug,
        seed.title,
        seed.excerpt,
        seed.description,
        seed.tags,
        seed.status,
        seed.sort_order,
        publishedAt,
        seed.link_url,
      ]
    );
    const projectId = rows[0].id as string;

    // Couverture
    const cover = makePng(800, 450, COLORS[colorIndex % COLORS.length]);
    colorIndex += 1;
    const coverResult = await uploadFile(
      cookie,
      "covers",
      undefined,
      `cover-${seed.slug}.png`,
      cover,
      "image/png"
    );
    const coverUrl = coverResult.results?.find((r: { ok: boolean }) => r.ok)?.url;
    if (coverUrl) {
      await pool.query("update projects set cover_url = $1 where id = $2", [
        coverUrl,
        projectId,
      ]);
    }

    // Galerie
    const galleryCount = seed.gallery;
    if (galleryCount > 0) {
      const names: string[] = [];
      for (let i = 0; i < galleryCount; i++) {
        const image = makePng(600, 600, COLORS[colorIndex % COLORS.length]);
        colorIndex += 1;
        names.push(`photo-${seed.slug}-${i + 1}.png`);
        const res = await uploadFile(
          cookie,
          "gallery",
          projectId,
          names[i],
          image,
          "image/png"
        );
        if (res.results?.some((r: { ok: boolean }) => r.ok)) totalImages += 1;
      }
    }

    // Fichiers annexes
    for (const file of seed.files) {
      const res = await uploadFile(
        cookie,
        "files",
        projectId,
        file.name,
        Buffer.from(file.content, "utf8"),
        "text/plain"
      );
      if (res.results?.some((r: { ok: boolean }) => r.ok)) totalFiles += 1;
    }

    console.log(
      `✓ Projet « ${seed.title} » (${seed.status}) — couverture + ${galleryCount} photo(s) + ${seed.files.length} fichier(s)`
    );
  }

  await pool.end();
  console.log(`\nTerminé : ${SEED_PROJECTS.length} projets, ${totalImages} photos, ${totalFiles} fichiers.`);
  console.log(`Ouvrez http://localhost:3000/projets et http://localhost:3000/login`);
}

main().catch((error) => {
  console.error("✗", error instanceof Error ? error.message : error);
  process.exit(1);
});

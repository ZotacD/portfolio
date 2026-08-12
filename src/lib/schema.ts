import { z } from "zod";

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Texte optionnel (chaîne vide acceptée, normalisée côté serveur).
 */
function optionalText(maxLength: number, message?: string) {
  return z
    .string()
    .trim()
    .max(maxLength, message ?? `Texte trop long (${maxLength} caractères max)`)
    .optional()
    .nullable();
}

export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne doit pas dépasser 200 caractères"),
  slug: z
    .string()
    .trim()
    .min(1, "Le slug est requis")
    .regex(
      slugRegex,
      "Slug invalide (minuscules, chiffres et tirets uniquement, ex : mon-projet)"
    ),
  excerpt: optionalText(500, "L'extrait ne doit pas dépasser 500 caractères"),
  description: optionalText(100000, "La description est trop longue"),
  cover_url: z.union([
    z.url("URL de couverture invalide"),
    z.literal(""),
    z.null(),
    z.undefined(),
  ]),
  link_url: z.union([
    z.url("URL du lien invalide"),
    z.literal(""),
    z.null(),
    z.undefined(),
  ]),
  tags: z
    .array(z.string().trim().min(1, "Un tag ne peut pas être vide").max(30, "Tag trop long"))
    .max(20, "Maximum 20 tags"),
  status: z.enum(["draft", "published"]),
  sort_order: z.number().int("L'ordre d'affichage doit être un entier"),
  published_at: z.string().datetime({ offset: true }).nullable(),
});

export const projectFileSchema = z.object({
  projectId: z.string().uuid("Identifiant de projet invalide"),
  name: z.string().trim().min(1, "Le nom du fichier est requis").max(255),
  storage_path: z.string().trim().min(1, "Le chemin de stockage est requis"),
  mime_type: z.string().trim().max(120).optional().nullable(),
  size: z.number().int().nonnegative().optional().nullable(),
});

export const socialSchema = z.object({
  github: z
    .union([z.url("URL GitHub invalide"), z.literal(""), z.null(), z.undefined()])
    .optional(),
  linkedin: z
    .union([z.url("URL LinkedIn invalide"), z.literal(""), z.null(), z.undefined()])
    .optional(),
  twitter: z
    .union([z.url("URL X (Twitter) invalide"), z.literal(""), z.null(), z.undefined()])
    .optional(),
});

export const profileSchema = z.object({
  name: optionalText(100),
  title: optionalText(200),
  bio: optionalText(10000),
  email: optionalText(200),
  phone: optionalText(50),
  location: optionalText(100),
  social: socialSchema,
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Votre nom est requis").max(100),
  email: z
    .string()
    .trim()
    .min(1, "Votre email est requis")
    .pipe(z.email("Adresse email invalide")),
  subject: z.string().trim().max(200).optional().nullable(),
  message: z
    .string()
    .trim()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(10000),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectFileInput = z.infer<typeof projectFileSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ContactInput = z.infer<typeof contactSchema>;

export const FILE_MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "application/pdf",
  "application/zip",
  "text/plain",
  "text/markdown",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
] as const;

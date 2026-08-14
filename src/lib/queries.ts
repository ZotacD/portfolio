import "server-only";

import { prisma } from "./db";
import { getPublicFileUrl } from "./supabase-server";
import type {
  ProjectFileWithUrl,
  ProjectImageWithUrl,
  ProjectRow,
  ProfileRow,
} from "@/types";

/**
 * Récupère la ligne profil (ligne unique id = 1).
 */
export async function getProfile(): Promise<ProfileRow | null> {
  try {
    const profile = await prisma.profile.findUnique({ where: { id: 1 } });
    if (!profile) return null;
    return {
      ...profile,
      social: (profile.social as Record<string, string> | null) ?? {},
    };
  } catch {
    return null;
  }
}

/**
 * Projets publiés, triés par ordre d'affichage puis date de publication.
 */
export async function getPublishedProjects(
  options: { limit?: number } = {}
): Promise<ProjectRow[]> {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "published" },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      take: options.limit,
    });
    return projects as ProjectRow[];
  } catch {
    return [];
  }
}

/**
 * Derniers projets publiés (pour l'accueil).
 */
export async function getLatestProjects(limit = 3): Promise<ProjectRow[]> {
  return getPublishedProjects({ limit });
}

/**
 * Un projet publié par slug, avec ses fichiers annexes.
 */
export async function getPublishedProject(
  slug: string
): Promise<{ project: ProjectRow; files: ProjectFileWithUrl[] } | null> {
  try {
    const project = await prisma.project.findFirst({
      where: { slug, status: "published" },
    });
    if (!project) return null;

    const files = await prisma.projectFile.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "asc" },
    });

    return {
      project: project as ProjectRow,
      files: files.map((file) => ({
        ...file,
        size: file.size == null ? null : Number(file.size),
        url: getPublicFileUrl(file.storagePath),
      })),
    };
  } catch {
    return null;
  }
}

/**
 * Fichiers d'un projet (avec URL publique de téléchargement).
 */
export async function getProjectFiles(
  projectId: string
): Promise<ProjectFileWithUrl[]> {
  try {
    const files = await prisma.projectFile.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });
    return files.map((file) => ({
      ...file,
      size: file.size == null ? null : Number(file.size),
      url: getPublicFileUrl(file.storagePath),
    }));
  } catch {
    return [];
  }
}

/**
 * Images de la galerie d'un projet (avec URL publique).
 */
export async function getProjectImages(
  projectId: string
): Promise<ProjectImageWithUrl[]> {
  try {
    const images = await prisma.projectImage.findMany({
      where: { projectId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return images.map((image) => ({
      ...image,
      url: getPublicFileUrl(image.storagePath),
    }));
  } catch {
    return [];
  }
}

/**
 * Projets précédent / suivant (par ordre d'affichage), pour la navigation.
 */
export async function getAdjacentProjects(
  slug: string
): Promise<{ prev: ProjectRow | null; next: ProjectRow | null }> {
  const all = await getPublishedProjects();
  const index = all.findIndex((project) => project.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null,
  };
}

/**
 * Slugs de tous les projets publiés (generateStaticParams, sitemap).
 */
export async function getAllPublishedSlugs(): Promise<string[]> {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "published" },
      select: { slug: true },
    });
    return projects.map((project) => project.slug);
  } catch {
    return [];
  }
}

/**
 * Tags distincts des projets publiés (filtres).
 */
export async function getDistinctTags(): Promise<string[]> {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "published" },
      select: { tags: true },
    });
    const set = new Set<string>();
    for (const project of projects) {
      for (const tag of project.tags) set.add(tag);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "fr"));
  } catch {
    return [];
  }
}

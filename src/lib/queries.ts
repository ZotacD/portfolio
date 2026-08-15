import "server-only";

import { cache } from "react";

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
export const getProfile = cache(async (): Promise<ProfileRow | null> => {
  const profile = await prisma.profile.findUnique({ where: { id: 1 } });
  if (!profile) return null;
  return {
    ...profile,
    social: (profile.social as Record<string, string> | null) ?? {},
  };
});

/**
 * Projets publiés, triés par ordre d'affichage puis date de publication.
 */
export const getPublishedProjects = cache(
  async (options: { limit?: number } = {}): Promise<ProjectRow[]> => {
    const projects = await prisma.project.findMany({
      where: { status: "published" },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      take: options.limit,
    });
    return projects as ProjectRow[];
  }
);

/**
 * Derniers projets publiés (pour l'accueil).
 */
export async function getLatestProjects(limit = 3): Promise<ProjectRow[]> {
  return getPublishedProjects({ limit });
}

/**
 * Un projet publié par slug, avec ses fichiers annexes.
 */
export const getPublishedProject = cache(
  async (
    slug: string
  ): Promise<{ project: ProjectRow; files: ProjectFileWithUrl[] } | null> => {
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
  }
);

/**
 * Fichiers d'un projet (avec URL publique de téléchargement).
 */
export const getProjectFiles = cache(
  async (projectId: string): Promise<ProjectFileWithUrl[]> => {
    const files = await prisma.projectFile.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });
    return files.map((file) => ({
      ...file,
      size: file.size == null ? null : Number(file.size),
      url: getPublicFileUrl(file.storagePath),
    }));
  }
);

/**
 * Images de la galerie d'un projet (avec URL publique).
 */
export const getProjectImages = cache(
  async (projectId: string): Promise<ProjectImageWithUrl[]> => {
    const images = await prisma.projectImage.findMany({
      where: { projectId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return images.map((image) => ({
      ...image,
      url: getPublicFileUrl(image.storagePath),
    }));
  }
);

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
export const getAllPublishedSlugs = cache(async (): Promise<string[]> => {
  const projects = await prisma.project.findMany({
    where: { status: "published" },
    select: { slug: true },
  });
  return projects.map((project) => project.slug);
});

/**
 * Tags distincts des projets publiés (filtres).
 */
export const getDistinctTags = cache(async (): Promise<string[]> => {
  const projects = await prisma.project.findMany({
    where: { status: "published" },
    select: { tags: true },
  });
  const set = new Set<string>();
  for (const project of projects) {
    for (const tag of project.tags) set.add(tag);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "fr"));
});

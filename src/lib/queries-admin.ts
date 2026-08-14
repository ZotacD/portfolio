import "server-only";

import { prisma } from "./db";
import type {
  AdminStats,
  ContactMessageRow,
  ProfileRow,
  ProjectFileRow,
  ProjectImageRow,
  ProjectRow,
  ProjectStatus,
} from "@/types";

export interface ProjectSearchItem {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
}

/**
 * Données légères des projets (recherche / command menu).
 */
export async function getProjectSearchData(): Promise<ProjectSearchItem[]> {
  const projects = await prisma.project.findMany({
    select: { id: true, title: true, slug: true, status: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return projects as ProjectSearchItem[];
}

/**
 * Derniers projets créés (dashboard).
 */
export async function getRecentProjects(limit = 5): Promise<ProjectRow[]> {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return projects as ProjectRow[];
}

/**
 * Répartition des tags parmi tous les projets (dashboard).
 */
export async function getTagsBreakdown(
  limit = 8
): Promise<{ tag: string; count: number }[]> {
  const projects = await prisma.project.findMany({ select: { tags: true } });
  const counts = new Map<string, number>();
  for (const project of projects) {
    for (const tag of project.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Nombre de projets avec une image de couverture.
 */
export async function getCoverCount(): Promise<number> {
  return prisma.project.count({ where: { coverUrl: { not: null } } });
}

/**
 * Tous les projets (brouillons compris), pour le dashboard.
 */
export async function getAdminProjects(): Promise<ProjectRow[]> {
  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return projects as ProjectRow[];
}

/**
 * Un projet et ses fichiers, pour l'édition.
 */
export async function getAdminProject(
  id: string
): Promise<{ project: ProjectRow | null; files: ProjectFileRow[] }> {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return { project: null, files: [] };

  const files = await prisma.projectFile.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "asc" },
  });

  return {
    project: project as ProjectRow,
    files: files.map((file) => ({
      ...file,
      size: file.size == null ? null : Number(file.size),
    })),
  };
}

/**
 * Images de la galerie d'un projet (dashboard).
 */
export async function getAdminProjectImages(
  projectId: string
): Promise<ProjectImageRow[]> {
  const images = await prisma.projectImage.findMany({
    where: { projectId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return images as ProjectImageRow[];
}

/**
 * Statistiques du dashboard.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const [total, published, drafts, files] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "published" } }),
    prisma.project.count({ where: { status: "draft" } }),
    prisma.projectFile.count(),
  ]);
  return { total, published, drafts, files };
}

/**
 * Profil complet pour l'édition (dashboard).
 */
export async function getAdminProfile(): Promise<ProfileRow | null> {
  const profile = await prisma.profile.findUnique({ where: { id: 1 } });
  if (!profile) return null;
  return {
    ...profile,
    social: (profile.social as Record<string, string> | null) ?? {},
  };
}

/**
 * Messages de contact, du plus récent au plus ancien.
 */
export async function getContactMessages(): Promise<ContactMessageRow[]> {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return messages as ContactMessageRow[];
}

/**
 * Nombre de messages de contact non lus.
 */
export async function getUnreadContactMessagesCount(): Promise<number> {
  return prisma.contactMessage.count({ where: { read: false } });
}

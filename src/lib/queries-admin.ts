import "server-only";

import { cache } from "react";

import { prisma } from "./db";
import type {
  AdminStats,
  ContactMessageRow,
  ProfileRow,
  ProjectFileRow,
  ProjectImageRow,
  ProjectRow,
} from "@/types";

/**
 * Répartition des tags parmi tous les projets (dashboard).
 */
export const getTagsBreakdown = cache(
  async (limit = 8): Promise<{ tag: string; count: number }[]> => {
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
);

/**
 * Nombre de projets avec une image de couverture.
 */
export const getCoverCount = cache(
  async (): Promise<number> => {
    return prisma.project.count({ where: { coverUrl: { not: null } } });
  }
);

/**
 * Tous les projets (brouillons compris), pour le dashboard.
 */
export const getAdminProjects = cache(
  async (): Promise<ProjectRow[]> => {
    const projects = await prisma.project.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return projects as ProjectRow[];
  }
);

/**
 * Un projet et ses fichiers, pour l'édition.
 */
export const getAdminProject = cache(
  async (
    id: string
  ): Promise<{ project: ProjectRow | null; files: ProjectFileRow[] }> => {
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
);

/**
 * Images de la galerie d'un projet (dashboard).
 */
export const getAdminProjectImages = cache(
  async (projectId: string): Promise<ProjectImageRow[]> => {
    const images = await prisma.projectImage.findMany({
      where: { projectId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return images as ProjectImageRow[];
  }
);

/**
 * Statistiques du dashboard.
 */
export const getAdminStats = cache(
  async (): Promise<AdminStats> => {
    const [total, published, drafts, files] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: "published" } }),
      prisma.project.count({ where: { status: "draft" } }),
      prisma.projectFile.count(),
    ]);
    return { total, published, drafts, files };
  }
);

/**
 * Profil complet pour l'édition (dashboard).
 */
export const getAdminProfile = cache(
  async (): Promise<ProfileRow | null> => {
    const profile = await prisma.profile.findUnique({ where: { id: 1 } });
    if (!profile) return null;
    return {
      ...profile,
      social: (profile.social as Record<string, string> | null) ?? {},
    };
  }
);

/**
 * Messages de contact, du plus récent au plus ancien.
 */
export const getContactMessages = cache(
  async (): Promise<ContactMessageRow[]> => {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return messages as ContactMessageRow[];
  }
);

/**
 * Nombre de messages de contact non lus.
 */
export const getUnreadContactMessagesCount = cache(
  async (): Promise<number> => {
    return prisma.contactMessage.count({ where: { read: false } });
  }
);

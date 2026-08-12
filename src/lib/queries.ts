import "server-only";

import { getPublicFileUrl, getSupabaseServer } from "./supabase-server";
import type {
  ProjectFileWithUrl,
  ProjectImageWithUrl,
  ProjectRow,
  ProfileRow,
} from "@/types";

/**
 * Récupère la ligne profil (ligne unique id = 1).
 * Renvoie `null` si non configuré ou indisponible.
 */
export async function getProfile(): Promise<ProfileRow | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return null;
    return data as ProfileRow;
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
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });
    if (options.limit) query = query.limit(options.limit);
    const { data, error } = await query;
    if (error || !data) return [];
    return (data as ProjectRow[]).map(normalizeProject);
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
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) return null;
    const project = normalizeProject(data as ProjectRow);

    const { data: fileRows, error: fileError } = await supabase
      .from("project_files")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true });
    if (fileError) return { project, files: [] };

    const files: ProjectFileWithUrl[] = ((fileRows as ProjectFileWithUrl[]) ?? []).map(
      (file) => ({
        ...file,
        url: getPublicFileUrl(file.storage_path),
      })
    );
    return { project, files };
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
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("project_files")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return (data as ProjectFileWithUrl[]).map((file) => ({
      ...file,
      url: getPublicFileUrl(file.storage_path),
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
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("project_images")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return (data as ProjectImageWithUrl[]).map((image) => ({
      ...image,
      url: getPublicFileUrl(image.storage_path),
    }));
  } catch {
    return [];
  }
}

/**
 * Projets précédent / suivant (par ordre d'affichage), pour la navigation.
 */
export async function getAdjacentProjects(  slug: string
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
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("slug")
      .eq("status", "published");
    if (error || !data) return [];
    return data.map((row) => row.slug);
  } catch {
    return [];
  }
}

/**
 * Tags distincts des projets publiés (filtres).
 */
export async function getDistinctTags(): Promise<string[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("tags")
      .eq("status", "published");
    if (error || !data) return [];
    const set = new Set<string>();
    for (const row of data) {
      const tags = (row.tags as string[] | null) ?? [];
      for (const tag of tags) set.add(tag);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "fr"));
  } catch {
    return [];
  }
}

function normalizeProject(project: ProjectRow): ProjectRow {
  return {
    ...project,
    tags: Array.isArray(project.tags) ? project.tags : [],
    status: project.status === "published" ? "published" : "draft",
  };
}

import "server-only";

import { getSupabaseAdmin } from "./supabase-admin";
import type {
  AdminStats,
  ContactMessageRow,
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
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, slug, status")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as ProjectSearchItem[];
  } catch {
    return [];
  }
}

/**
 * Derniers projets créés (dashboards).
 */
export async function getRecentProjects(limit = 5): Promise<ProjectRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as ProjectRow[];
  } catch {
    return [];
  }
}
/**
 * Tous les projets (brouillons compris), pour le dashboard.
 */
export async function getAdminProjects(): Promise<ProjectRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as ProjectRow[];
  } catch {
    return [];
  }
}

/**
 * Un projet et ses fichiers, pour l'édition.
 */
export async function getAdminProject(
  id: string
): Promise<{ project: ProjectRow | null; files: ProjectFileRow[] }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { project: null, files: [] };
  try {
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !project) return { project: null, files: [] };

    const { data: files } = await supabase
      .from("project_files")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true });

    return {
      project: project as ProjectRow,
      files: (files as ProjectFileRow[]) ?? [],
    };
  } catch {
    return { project: null, files: [] };
  }
}

/**
 * Statistiques du dashboard.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { total: 0, published: 0, drafts: 0, files: 0 };
  try {
    const { count: total } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });
    const { count: published } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");
    const { count: drafts } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft");
    const { count: files } = await supabase
      .from("project_files")
      .select("*", { count: "exact", head: true });

    return {
      total: total ?? 0,
      published: published ?? 0,
      drafts: drafts ?? 0,
      files: files ?? 0,
    };
  } catch {
    return { total: 0, published: 0, drafts: 0, files: 0 };
  }
}

/**
 * Profil complet pour l'édition (dashboard).
 */
export async function getAdminProfile() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * R�partition des tags parmi tous les projets (dashboards).
 */
export async function getTagsBreakdown(limit = 8): Promise<
  { tag: string; count: number }[]
> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from("projects").select("tags");
    if (error || !data) return [];
    const counts = new Map<string, number>();
    for (const row of data) {
      const tags = (row.tags as string[] | null) ?? [];
      for (const tag of tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Nombre de projets avec une image de couverture.
 */
export async function getCoverCount(): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;
  try {
    const { count } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .not("cover_url", "is", null);
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Images de la galerie d'un projet (dashboard).
 */
export async function getAdminProjectImages(
  projectId: string
): Promise<ProjectImageRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("project_images")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data as ProjectImageRow[];
  } catch {
    return [];
  }
}

/**
 * Messages de contact, du plus r�cent au plus ancien.
 */
export async function getContactMessages(): Promise<ContactMessageRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as ContactMessageRow[];
  } catch {
    return [];
  }
}

/**
 * Nombre de messages de contact non lus.
 */
export async function getUnreadContactMessagesCount(): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;
  try {
    const { count } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false);
    return count ?? 0;
  } catch {
    return 0;
  }
}

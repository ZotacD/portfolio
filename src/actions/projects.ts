"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { projectSchema, type ProjectInput } from "@/lib/schema";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { removeFromStorage } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import type { ActionState } from "./types";
import type { z } from "zod";

function errorState(result: { success: false; error: z.ZodError }): ActionState {
  return {
    status: "error",
    message: "Le formulaire contient des erreurs.",
    fieldErrors: result.error.flatten().fieldErrors,
  };
}

/**
 * Normalise la saisie avant validation (slug auto, chaînes vides -> null).
 */
function normalize(input: ProjectInput): ProjectInput {
  return {
    ...input,
    slug: input.slug.trim() || slugify(input.title),
    excerpt: input.excerpt ? input.excerpt.trim() || null : null,
    description: input.description ? input.description.trim() || null : null,
    cover_url: input.cover_url && input.cover_url !== "" ? input.cover_url : null,
    link_url: input.link_url && input.link_url !== "" ? input.link_url : null,
  };
}

function normalizePublishedAt(input: ProjectInput): ProjectInput {
  return {
    ...input,
    published_at:
      input.status === "published" && !input.published_at
        ? new Date().toISOString()
        : input.published_at,
  };
}

export async function createProject(input: ProjectInput): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { status: "error", message: "Session admin requise." };

  const parsed = projectSchema.safeParse(normalize(input));
  if (!parsed.success) return errorState(parsed);

  const supabase = getSupabaseAdmin();
  if (!supabase)
    return { status: "error", message: "Configuration Supabase manquante." };

  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", parsed.data.slug)
    .maybeSingle();
  if (existing) {
    return {
      status: "error",
      message: "Ce slug existe déjà.",
      fieldErrors: { slug: ["Un projet utilise déjà ce slug."] },
    };
  }

  const { error } = await supabase
    .from("projects")
    .insert(normalizePublishedAt(parsed.data));
  if (error) {
    return { status: "error", message: `Erreur lors de la création : ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/projets");
  revalidatePath("/admin/projets");
  return { status: "success", message: "Projet créé avec succès." };
}

export async function updateProject(
  id: string,
  input: ProjectInput
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { status: "error", message: "Session admin requise." };
  if (!id) return { status: "error", message: "Identifiant de projet manquant." };

  const parsed = projectSchema.safeParse(normalize(input));
  if (!parsed.success) return errorState(parsed);

  const supabase = getSupabaseAdmin();
  if (!supabase)
    return { status: "error", message: "Configuration Supabase manquante." };

  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", parsed.data.slug)
    .neq("id", id)
    .maybeSingle();
  if (existing) {
    return {
      status: "error",
      message: "Ce slug est déjà utilisé par un autre projet.",
      fieldErrors: { slug: ["Un autre projet utilise déjà ce slug."] },
    };
  }

  const { error } = await supabase
    .from("projects")
    .update(normalizePublishedAt(parsed.data))
    .eq("id", id);
  if (error) {
    return { status: "error", message: `Erreur lors de la mise à jour : ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/projets", "layout");
  revalidatePath("/admin/projets");
  return { status: "success", message: "Projet mis à jour avec succès." };
}

export async function deleteProject(id: string): Promise<void> {
  const session = await requireAdmin();
  if (!session) redirect("/login");
  if (!id) redirect("/admin/projets");

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: files } = await supabase
      .from("project_files")
      .select("storage_path")
      .eq("project_id", id);
    if (files && files.length > 0) {
      await removeFromStorage(files.map((file) => file.storage_path));
    }
    await supabase.from("projects").delete().eq("id", id);
  }

  revalidatePath("/");
  revalidatePath("/projets", "layout");
  revalidatePath("/admin/projets");
  redirect("/admin/projets");
}

/**
 * Bascule rapide d'un projet entre brouillon et publié (depuis la liste).
 */
export async function toggleProjectStatus(
  id: string,
  status: "draft" | "published"
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { status: "error", message: "Session admin requise." };

  const supabase = getSupabaseAdmin();
  if (!supabase)
    return { status: "error", message: "Configuration Supabase manquante." };

  const { data: current } = await supabase
    .from("projects")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  const published_at =
    status === "published"
      ? (current?.published_at ?? new Date().toISOString())
      : (current?.published_at ?? null);

  const { error } = await supabase
    .from("projects")
    .update({ status, published_at })
    .eq("id", id);

  if (error) {
    return { status: "error", message: `Erreur lors de la mise à jour : ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/projets", "layout");
  revalidatePath("/admin/projets");
  return {
    status: "success",
    message:
      status === "published" ? "Projet publié." : "Projet repassé en brouillon.",
  };
}

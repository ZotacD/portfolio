"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { removeFromStorage } from "@/lib/storage";
import type { ActionState } from "./types";

export async function deleteProjectFile(
  id: string,
  projectId: string
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { status: "error", message: "Session admin requise." };
  if (!id) return { status: "error", message: "Identifiant de fichier manquant." };

  const supabase = getSupabaseAdmin();
  if (!supabase)
    return { status: "error", message: "Configuration Supabase manquante." };

  const { data: file } = await supabase
    .from("project_files")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (file?.storage_path) {
    await removeFromStorage([file.storage_path]);
  }

  const { error } = await supabase.from("project_files").delete().eq("id", id);
  if (error) {
    return { status: "error", message: `Erreur lors de la suppression : ${error.message}` };
  }

  revalidatePath("/projets", "layout");
  revalidatePath(`/admin/projets/${projectId}`);
  return { status: "success", message: "Fichier supprimé." };
}

export async function deleteProjectImage(
  id: string,
  projectId: string
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { status: "error", message: "Session admin requise." };
  if (!id) return { status: "error", message: "Identifiant d'image manquant." };

  const supabase = getSupabaseAdmin();
  if (!supabase)
    return { status: "error", message: "Configuration Supabase manquante." };

  const { data: image } = await supabase
    .from("project_images")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (image?.storage_path) {
    await removeFromStorage([image.storage_path]);
  }

  const { error } = await supabase.from("project_images").delete().eq("id", id);
  if (error) {
    return {
      status: "error",
      message: `Erreur lors de la suppression : ${error.message}`,
    };
  }

  revalidatePath("/projets", "layout");
  revalidatePath(`/admin/projets/${projectId}`);
  return { status: "success", message: "Image supprimée." };
}

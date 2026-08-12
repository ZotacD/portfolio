import { NextResponse } from "next/server";

import { getAuth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getPublicFileUrl } from "@/lib/supabase-server";
import { uploadToStorage } from "@/lib/storage";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_MIME_TYPES,
  FILE_MAX_SIZE,
} from "@/lib/schema";

export const runtime = "nodejs";

/**
 * Upload de fichiers (pièces jointes, galerie ou image de couverture d'un
 * projet). Protégé par la session admin ; utilise la clé service_role.
 * - purpose "files"   -> table project_files
 * - purpose "gallery" -> table project_images
 * - purpose "covers"  -> renvoie l'URL (stockée dans projects.cover_url)
 */
export async function POST(request: Request) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  const admin = process.env.ADMIN_EMAIL;
  const isAdmin =
    session?.user &&
    admin &&
    session.user.email?.toLowerCase() === admin.toLowerCase();
  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const formData = await request.formData();
  const purpose = String(formData.get("purpose") ?? "files");
  const projectId = String(formData.get("projectId") ?? "");
  const files = formData.getAll("files").filter((entry) => entry instanceof File) as File[];

  if (!["files", "gallery", "covers"].includes(purpose)) {
    return NextResponse.json({ error: "Type d'upload invalide." }, { status: 400 });
  }

  if (files.length === 0) {
    return NextResponse.json({ error: "Aucun fichier envoyé." }, { status: 400 });
  }

  if (purpose !== "covers" && !projectId) {
    return NextResponse.json({ error: "Identifiant de projet manquant." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Configuration Supabase manquante." },
      { status: 500 }
    );
  }

  if (purpose !== "covers") {
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .maybeSingle();
    if (!project) {
      return NextResponse.json({ error: "Projet introuvable." }, { status: 400 });
    }
  }

  const isImagePurpose = purpose === "covers" || purpose === "gallery";
  const allowedMimes = isImagePurpose
    ? ALLOWED_IMAGE_MIME_TYPES
    : ALLOWED_MIME_TYPES;
  const folder = purpose === "files" ? "files" : purpose === "gallery" ? "images" : "covers";
  const table = purpose === "files" ? "project_files" : "project_images";

  const results: Array<{
    ok: boolean;
    name?: string;
    error?: string;
    url?: string | null;
    storage_path?: string;
    file?: unknown;
  }> = [];

  for (const file of files) {
    if (file.size > FILE_MAX_SIZE) {
      results.push({
        ok: false,
        name: file.name,
        error: "Fichier trop volumineux (10 Mo maximum).",
      });
      continue;
    }

    const mimeType = file.type;
    if (mimeType && !(allowedMimes as readonly string[]).includes(mimeType)) {
      results.push({
        ok: false,
        name: file.name,
        error: "Type de fichier non autorisé.",
      });
      continue;
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const storagePath = await uploadToStorage({
      bytes,
      name: file.name,
      mimeType,
      folder,
    });

    if (!storagePath) {
      results.push({
        ok: false,
        name: file.name,
        error: "Échec de l'upload vers le stockage.",
      });
      continue;
    }

    if (purpose === "covers") {
      results.push({
        ok: true,
        name: file.name,
        url: getPublicFileUrl(storagePath),
        storage_path: storagePath,
      });
      continue;
    }

    const { data, error } = await supabase
      .from(table)
      .insert(
        purpose === "files"
          ? {
              project_id: projectId,
              name: file.name,
              storage_path: storagePath,
              mime_type: mimeType || null,
              size: file.size,
            }
          : {
              project_id: projectId,
              storage_path: storagePath,
            }
      )
      .select()
      .single();

    if (error) {
      results.push({
        ok: false,
        name: file.name,
        error: "Échec de l'enregistrement en base.",
      });
      continue;
    }

    results.push({ ok: true, name: file.name, file: data });
  }

  return NextResponse.json({ results });
}

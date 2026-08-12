import "server-only";

import { randomUUID } from "node:crypto";

import { getSupabaseAdmin } from "./supabase-admin";
import { FILE_MAX_SIZE } from "./schema";

export const BUCKET = "project-files";

const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
  pdf: "application/pdf",
  zip: "application/zip",
  txt: "text/plain",
  md: "text/markdown",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/**
 * Sanitise un nom de fichier pour une utilisation dans le storage.
 */
export function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^-+|-+$/g, "");
  return base || "fichier";
}

/**
 * Déduit un MIME type depuis l'extension, si le type est vide.
 */
export function inferMimeType(name: string, provided?: string | null): string | null {
  if (provided && provided !== "application/octet-stream") return provided;
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_MIME[extension] ?? null;
}

/**
 * Upload d'un fichier binaire dans le bucket `project-files`.
 * Renvoie le chemin de stockage, ou null en cas d'échec.
 */
export async function uploadToStorage(input: {
  bytes: Uint8Array;
  name: string;
  mimeType: string;
  folder: "files" | "covers" | "images";
}): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  if (input.bytes.byteLength > FILE_MAX_SIZE) return null;

  const safeName = sanitizeFileName(input.name);
  const path = `${input.folder}/${randomUUID()}-${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, input.bytes, {
      contentType: input.mimeType || "application/octet-stream",
      upsert: false,
    });

  if (error) return null;
  return path;
}

/**
 * Supprime un ou plusieurs fichiers du bucket.
 */
export async function removeFromStorage(paths: string[]): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase || paths.length === 0) return;
  await supabase.storage.from(BUCKET).remove(paths);
}

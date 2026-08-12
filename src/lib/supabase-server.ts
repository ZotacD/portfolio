import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase serveur (clé anon) pour les lectures publiques.
 * Renvoie `null` si la configuration est absente.
 */
export function getSupabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

export function getPublicFileUrl(storagePath: string): string | null {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  return supabase.storage.from("project-files").getPublicUrl(storagePath).data.publicUrl;
}

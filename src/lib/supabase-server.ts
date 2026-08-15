import "server-only";

const BUCKET = "project-files";

/**
 * URL publique d'un fichier du bucket (lecture publique).
 * Construite directement depuis l'URL Supabase, sans clé anon.
 */
export function getPublicFileUrl(storagePath: string): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  return `${url}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

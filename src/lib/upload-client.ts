export interface UploadResultItem {
  ok: boolean;
  name?: string;
  error?: string;
  url?: string | null;
  storagePath?: string;
  file?: unknown;
}

export interface UploadResponse {
  results: UploadResultItem[];
  error?: string;
}

/**
 * Upload côté navigateur vers /api/admin/upload.
 * Les fichiers sont transmis tels quels ; le serveur valide et utilise
 * la clé service_role pour l'écriture dans le storage.
 */
export async function uploadFilesClient(input: {
  projectId?: string;
  purpose: "files" | "covers" | "gallery";
  files: File[];
}): Promise<UploadResponse> {
  const formData = new FormData();
  formData.set("purpose", input.purpose);
  if (input.projectId) formData.set("projectId", input.projectId);
  for (const file of input.files) {
    formData.append("files", file);
  }

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  let payload: UploadResponse | null = null;
  try {
    payload = (await response.json()) as UploadResponse;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error ?? "Échec de l'upload.");
  }
  return payload ?? { results: [] };
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import { uploadFilesClient } from "@/lib/upload-client";
import { deleteProjectFile } from "@/actions/files";
import type { ProjectFileWithUrl } from "@/types";

function DeleteFileButton({
  fileId,
  projectId,
}: {
  fileId: string;
  projectId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProjectFile(fileId, projectId);
      if (result.status === "success") {
        toast.success(result.message ?? "Fichier supprimé.");
        router.refresh();
      } else {
        toast.error(result.message ?? "Erreur lors de la suppression.");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Supprimer le fichier"
      disabled={pending}
      onClick={handleDelete}
    >
      {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
    </Button>
  );
}

export function DropzoneFichiers({
  projectId,
  files,
}: {
  projectId: string;
  files: ProjectFileWithUrl[];
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    const selected = fileList ? Array.from(fileList) : [];
    if (selected.length === 0) return;

    setUploading(true);
    try {
      const response = await uploadFilesClient({
        projectId,
        purpose: "files",
        files: selected,
      });

      const okCount = response.results.filter((result) => result.ok).length;
      const failures = response.results.filter((result) => !result.ok);

      if (okCount > 0) {
        toast.success(
          okCount === 1
            ? "1 fichier téléversé."
            : `${okCount} fichiers téléversés.`
        );
        router.refresh();
      }
      for (const failure of failures) {
        toast.error(`${failure.name ?? "Fichier"} : ${failure.error}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Échec de l'upload."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center transition-colors hover:bg-muted/50">
        <Upload className="size-6 text-muted-foreground" />
        <span className="text-sm font-medium">
          {uploading ? "Upload en cours…" : "Glissez des fichiers ici"}
        </span>
        <span className="text-xs text-muted-foreground">
          ou cliquez pour choisir — images, PDF, archives… (10 Mo max par
          fichier)
        </span>
        <input
          type="file"
          multiple
          className="sr-only"
          disabled={uploading}
          onChange={(event) => {
            void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>

      {uploading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" /> Téléversement en cours…
        </p>
      )}

      {files.length > 0 ? (
        <ul className="grid gap-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.size ? formatBytes(file.size) : "—"}
                  {file.mime_type ? ` · ${file.mime_type}` : ""}
                </p>
              </div>
              {file.url && (
                <Button asChild variant="ghost" size="icon" aria-label="Télécharger">
                  <a
                    href={file.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Upload className="rotate-180" />
                  </a>
                </Button>
              )}
              <DeleteFileButton fileId={file.id} projectId={projectId} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucun fichier annexe pour le moment.
        </p>
      )}
    </div>
  );
}

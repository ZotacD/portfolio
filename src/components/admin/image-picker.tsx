"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uploadFilesClient } from "@/lib/upload-client";
import { deleteProjectImage } from "@/actions/files";
import type { ProjectImageWithUrl } from "@/types";

interface ImagePickerProps {
  /**
   * "covers" : une seule image, valeur contrôlée (coverUrl).
   * "gallery" : plusieurs images, listées et gérées côté serveur.
   */
  purpose: "covers" | "gallery";
  projectId?: string;
  /** Mode couverture : valeur actuelle (URL) et callback. */
  value?: string | null;
  onChange?: (url: string | null) => void;
  /** Mode galerie : images existantes. */
  images?: ProjectImageWithUrl[];
  hint?: string;
}

export function ImagePicker({
  purpose,
  projectId,
  value,
  onChange,
  images = [],
  hint,
}: ImagePickerProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const isSingle = purpose === "covers";

  async function handleFiles(fileList: FileList | null) {
    const selected = fileList ? Array.from(fileList) : [];
    if (selected.length === 0) return;

    setUploading(true);
    try {
      const response = await uploadFilesClient({
        projectId,
        purpose,
        files: isSingle ? [selected[0]] : selected,
      });

      const okCount = response.results.filter((result) => result.ok).length;
      const failures = response.results.filter((result) => !result.ok);

      if (isSingle) {
        const uploaded = response.results.find((result) => result.ok);
        if (uploaded?.url) {
          onChange?.(uploaded.url);
          toast.success("Image de couverture mise à jour.");
        } else {
          toast.error(
            response.results.find((result) => !result.ok)?.error ??
              "Échec de l'upload."
          );
        }
      } else {
        if (okCount > 0) {
          toast.success(
            okCount === 1 ? "1 photo ajoutée." : `${okCount} photos ajoutées.`
          );
          router.refresh();
        }
        for (const failure of failures) {
          toast.error(`${failure.name ?? "Photo"} : ${failure.error}`);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de l'upload.");
    } finally {
      setUploading(false);
    }
  }

  function handleDelete(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = await deleteProjectImage(id, projectId ?? "");
      if (result.status === "success") {
        toast.success(result.message ?? "Image supprimée.");
        router.refresh();
      } else {
        toast.error(result.message ?? "Erreur lors de la suppression.");
      }
      setPendingId(null);
    });
  }

  return (
    <div className="grid gap-3">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/50">
        <ImagePlus className="size-6 text-muted-foreground" />
        <span className="text-sm font-medium">
          {uploading
            ? "Upload en cours…"
            : isSingle
              ? "Choisir une image"
              : "Ajouter des photos"}
        </span>
        <span className="text-xs text-muted-foreground">
          {hint ?? "JPEG, PNG, WebP… (10 Mo max par image)"}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple={!isSingle}
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

      {isSingle ? (
        value ? (
          <div className="group relative aspect-video w-full overflow-hidden rounded-lg border bg-muted sm:w-72">
            <Image
              src={value}
              alt="Image de couverture"
              fill
              className="object-cover"
              sizes="288px"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 size-8"
              aria-label="Retirer l'image de couverture"
              onClick={() => onChange?.(null)}
            >
              <Trash2 />
            </Button>
          </div>
        ) : null
      ) : images.length > 0 ? (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {images.map((image) => (
            <li
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              {image.url && (
                <Image
                  src={image.url}
                  alt={image.alt ?? "Photo du projet"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 20vw"
                />
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1.5 top-1.5 size-7 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Supprimer la photo"
                disabled={pendingId === image.id}
                onClick={() => handleDelete(image.id)}
              >
                {pendingId === image.id ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Trash2 />
                )}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          {isSingle ? "Aucune image de couverture." : "Aucune photo pour le moment."}
        </p>
      )}
    </div>
  );
}

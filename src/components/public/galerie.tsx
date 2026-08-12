"use client";

import { useState } from "react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { ProjectImageWithUrl } from "@/types";

export function Galerie({
  images,
  alt,
}: {
  images: ProjectImageWithUrl[];
  alt: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const current = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={`Voir la photo ${index + 1}`}
          >
            {image.url && (
              <Image
                src={image.url}
                alt={image.alt ?? `${alt} — photo ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            )}
          </button>
        ))}
      </div>

      <Dialog
        open={openIndex !== null}
        onOpenChange={(open) => {
          if (!open) setOpenIndex(null);
        }}
      >
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
          {current?.url && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-background">
              <Image
                src={current.url}
                alt={current.alt ?? `${alt} — photo ${(openIndex ?? 0) + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

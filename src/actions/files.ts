"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { removeFromStorage } from "@/lib/storage";
import type { ActionState } from "./types";

export async function deleteProjectFile(
  id: string,
  projectId: string
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { status: "error", message: "Session admin requise." };
  if (!id) return { status: "error", message: "Identifiant de fichier manquant." };

  const file = await prisma.projectFile.findUnique({
    where: { id },
    select: { storagePath: true },
  });

  if (file?.storagePath) {
    await removeFromStorage([file.storagePath]);
  }

  await prisma.projectFile.delete({ where: { id } });

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

  const image = await prisma.projectImage.findUnique({
    where: { id },
    select: { storagePath: true },
  });

  if (image?.storagePath) {
    await removeFromStorage([image.storagePath]);
  }

  await prisma.projectImage.delete({ where: { id } });

  revalidatePath("/projets", "layout");
  revalidatePath(`/admin/projets/${projectId}`);
  return { status: "success", message: "Image supprimée." };
}

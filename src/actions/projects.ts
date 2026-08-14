"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { projectSchema, type ProjectInput } from "@/lib/schema";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { removeFromStorage } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import type { ActionState } from "./types";
import type { z } from "zod";

function errorState(result: { success: false; error: z.ZodError }): ActionState {
  return {
    status: "error",
    message: "Le formulaire contient des erreurs.",
    fieldErrors: result.error.flatten().fieldErrors,
  };
}

/**
 * Normalise la saisie avant validation (slug auto, chaînes vides -> null).
 */
function normalize(input: ProjectInput): ProjectInput {
  return {
    ...input,
    slug: input.slug.trim() || slugify(input.title),
    excerpt: input.excerpt ? input.excerpt.trim() || null : null,
    description: input.description ? input.description.trim() || null : null,
    coverUrl: input.coverUrl && input.coverUrl !== "" ? input.coverUrl : null,
    linkUrl: input.linkUrl && input.linkUrl !== "" ? input.linkUrl : null,
  };
}

/**
 * Transforme la saisie validée en données Prisma.
 */
function buildData(input: ProjectInput) {
  const publishedAt =
    input.status === "published" && !input.publishedAt
      ? new Date()
      : input.publishedAt
        ? new Date(input.publishedAt)
        : null;

  return {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt ?? null,
    description: input.description ?? null,
    coverUrl: input.coverUrl ?? null,
    linkUrl: input.linkUrl ?? null,
    tags: input.tags,
    status: input.status,
    sortOrder: input.sortOrder,
    publishedAt,
  };
}

export async function createProject(input: ProjectInput): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { status: "error", message: "Session admin requise." };

  const parsed = projectSchema.safeParse(normalize(input));
  if (!parsed.success) return errorState(parsed);

  const existing = await prisma.project.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) {
    return {
      status: "error",
      message: "Ce slug existe déjà.",
      fieldErrors: { slug: ["Un projet utilise déjà ce slug."] },
    };
  }

  await prisma.project.create({ data: buildData(parsed.data) });

  revalidatePath("/");
  revalidatePath("/projets");
  revalidatePath("/admin/projets");
  return { status: "success", message: "Projet créé avec succès." };
}

export async function updateProject(
  id: string,
  input: ProjectInput
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { status: "error", message: "Session admin requise." };
  if (!id) return { status: "error", message: "Identifiant de projet manquant." };

  const parsed = projectSchema.safeParse(normalize(input));
  if (!parsed.success) return errorState(parsed);

  const existing = await prisma.project.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing && existing.id !== id) {
    return {
      status: "error",
      message: "Ce slug est déjà utilisé par un autre projet.",
      fieldErrors: { slug: ["Un autre projet utilise déjà ce slug."] },
    };
  }

  await prisma.project.update({
    where: { id },
    data: buildData(parsed.data),
  });

  revalidatePath("/");
  revalidatePath("/projets", "layout");
  revalidatePath("/admin/projets");
  return { status: "success", message: "Projet mis à jour avec succès." };
}

export async function deleteProject(id: string): Promise<void> {
  const session = await requireAdmin();
  if (!session) redirect("/login");
  if (!id) redirect("/admin/projets");

  const [files, images] = await Promise.all([
    prisma.projectFile.findMany({
      where: { projectId: id },
      select: { storagePath: true },
    }),
    prisma.projectImage.findMany({
      where: { projectId: id },
      select: { storagePath: true },
    }),
  ]);

  const paths = [
    ...files.map((file) => file.storagePath),
    ...images.map((image) => image.storagePath),
  ];
  if (paths.length > 0) {
    await removeFromStorage(paths);
  }

  await prisma.project.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/projets", "layout");
  revalidatePath("/admin/projets");
  redirect("/admin/projets");
}

/**
 * Bascule rapide d'un projet entre brouillon et publié (depuis la liste).
 */
export async function toggleProjectStatus(
  id: string,
  status: "draft" | "published"
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { status: "error", message: "Session admin requise." };

  const current = await prisma.project.findUnique({
    where: { id },
    select: { publishedAt: true },
  });

  const publishedAt =
    status === "published"
      ? (current?.publishedAt ?? new Date())
      : (current?.publishedAt ?? null);

  await prisma.project.update({
    where: { id },
    data: { status, publishedAt },
  });

  revalidatePath("/");
  revalidatePath("/projets", "layout");
  revalidatePath("/admin/projets");
  return {
    status: "success",
    message:
      status === "published" ? "Projet publié." : "Projet repassé en brouillon.",
  };
}

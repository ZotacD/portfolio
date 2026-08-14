"use server";

import { revalidatePath } from "next/cache";

import { profileSchema, type ProfileInput } from "@/lib/schema";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ActionState } from "./types";

function trimOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalize(input: ProfileInput): ProfileInput {
  return {
    name: trimOrNull(input.name),
    title: trimOrNull(input.title),
    bio: trimOrNull(input.bio),
    email: trimOrNull(input.email),
    phone: trimOrNull(input.phone),
    location: trimOrNull(input.location),
    social: Object.fromEntries(
      Object.entries(input.social ?? {}).filter(
        ([, value]) => value && value.trim()
      )
    ),
  };
}

export async function updateProfile(input: ProfileInput): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { status: "error", message: "Session admin requise." };

  const parsed = profileSchema.safeParse(normalize(input));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Le formulaire contient des erreurs.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.profile.upsert({
    where: { id: 1 },
    create: { id: 1, ...parsed.data },
    update: { ...parsed.data },
  });

  revalidatePath("/");
  revalidatePath("/admin/parametres");
  return { status: "success", message: "Paramètres enregistrés avec succès." };
}

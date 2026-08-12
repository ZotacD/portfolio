"use server";

import { revalidatePath } from "next/cache";

import { profileSchema, type ProfileInput } from "@/lib/schema";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ActionState } from "./types";

function normalize(input: ProfileInput): ProfileInput {
  return {
    name: input.name ? input.name.trim() || null : null,
    title: input.title ? input.title.trim() || null : null,
    bio: input.bio ? input.bio.trim() || null : null,
    email: input.email ? input.email.trim() || null : null,
    phone: input.phone ? input.phone.trim() || null : null,
    location: input.location ? input.location.trim() || null : null,
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

  const supabase = getSupabaseAdmin();
  if (!supabase)
    return { status: "error", message: "Configuration Supabase manquante." };

  const { error } = await supabase
    .from("profile")
    .upsert(
      {
        id: 1,
        ...parsed.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (error) {
    return {
      status: "error",
      message: `Erreur lors de l'enregistrement : ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/parametres");
  return { status: "success", message: "Paramètres enregistrés avec succès." };
}

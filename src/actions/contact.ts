"use server";

import { revalidatePath } from "next/cache";

import { contactSchema, type ContactInput } from "@/lib/schema";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ActionState } from "./types";

/**
 * Envoi du formulaire de contact (page publique). Le message est stocké en
 * base pour être géré depuis le dashboard. Un webhook optionnel
 * (`CONTACT_WEBHOOK_URL`) peut notifier un service externe.
 */
export async function sendContactMessage(input: ContactInput): Promise<ActionState> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Le formulaire contient des erreurs.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    },
  });

  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          subject: parsed.data.subject ?? "",
        }),
      });
      if (!response.ok) {
        return {
          status: "error",
          message: "Une erreur est survenue lors de l'envoi. Réessayez plus tard.",
        };
      }
    } catch {
      return {
        status: "error",
        message: "Une erreur est survenue lors de l'envoi. Réessayez plus tard.",
      };
    }
  }

  return {
    status: "success",
    message: "Votre message a bien été envoyé. Merci !",
  };
}

/**
 * Marque un message comme lu ou non lu (dashboard).
 */
export async function toggleMessageRead(
  id: string,
  read: boolean
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { status: "error", message: "Session admin requise." };
  if (!id) return { status: "error", message: "Identifiant de message manquant." };

  await prisma.contactMessage.update({
    where: { id },
    data: { read },
  });

  revalidatePath("/admin/messages");
  return {
    status: "success",
    message: read ? "Message marqué comme lu." : "Message marqué comme non lu.",
  };
}

/**
 * Marque tous les messages comme lus (dashboard).
 */
export async function markAllMessagesRead(): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { status: "error", message: "Session admin requise." };

  await prisma.contactMessage.updateMany({
    where: { read: false },
    data: { read: true },
  });

  revalidatePath("/admin/messages");
  return { status: "success", message: "Tous les messages sont marqués comme lus." };
}

/**
 * Supprime un message de contact (dashboard).
 */
export async function deleteContactMessage(id: string): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { status: "error", message: "Session admin requise." };
  if (!id) return { status: "error", message: "Identifiant de message manquant." };

  await prisma.contactMessage.delete({ where: { id } });

  revalidatePath("/admin/messages");
  return { status: "success", message: "Message supprimé." };
}

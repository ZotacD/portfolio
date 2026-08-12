"use server";

import { contactSchema, type ContactInput } from "@/lib/schema";
import type { ActionState } from "./types";

/**
 * Envoi du formulaire de contact.
 * Si `CONTACT_WEBHOOK_URL` est défini, le message est transmis au endpoint
 * (ex : webhook email). Sinon, la demande est simplement validée.
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

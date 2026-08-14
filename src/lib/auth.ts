import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";

import { prisma } from "./db";

/**
 * Crée l'instance Better Auth. Le retour est déduit de cet appel afin de
 * conserver le typage générique exact de `betterAuth`.
 */
function createAuth() {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [
      process.env.BETTER_AUTH_URL,
      process.env.NEXT_PUBLIC_SITE_URL,
    ].filter(Boolean) as string[],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    databaseHooks: {
      user: {
        create: {
          // Un seul compte autorisé : l'adresse ADMIN_EMAIL.
          before: async (user) => {
            const admin = process.env.ADMIN_EMAIL;
            if (
              admin &&
              user.email &&
              user.email.toLowerCase() !== admin.toLowerCase()
            ) {
              return false;
            }
          },
        },
      },
    },
  });
}

export type Auth = Awaited<ReturnType<typeof createAuth>>;

let cachedPromise: Promise<Auth> | null = null;

/**
 * Renvoie l'instance Better Auth (créée paresseusement pour ne pas
 * initialiser de connexion pendant le build).
 */
export async function getAuth(): Promise<Auth> {
  if (cachedPromise) return cachedPromise;
  cachedPromise = Promise.resolve(createAuth());
  return cachedPromise;
}

/**
 * Vérifie qu'une session admin est active. Renvoie la session, sinon null.
 * À appeler côté serveur dans toutes les mutations / routes protégées.
 */
export async function requireAdmin() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const admin = process.env.ADMIN_EMAIL;
  if (!admin || session.user.email?.toLowerCase() !== admin.toLowerCase()) {
    return null;
  }
  return session;
}

export type AdminSession = Awaited<ReturnType<typeof requireAdmin>>;

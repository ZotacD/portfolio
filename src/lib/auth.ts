import { betterAuth } from "better-auth";
import { kyselyAdapter } from "@better-auth/kysely-adapter";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { headers } from "next/headers";

import type { DB } from "../types/db";

/**
 * Crée l'instance Better Auth. Le retour est déduit de cet appel afin de
 * conserver le typage générique exact de `betterAuth`.
 */
function createAuth() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL manquante dans l'environnement.");
  }

  const db = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString, max: 10 }),
    }),
  });

  return betterAuth({
      database: kyselyAdapter(db, { type: "postgres" }),
      baseURL: process.env.BETTER_AUTH_URL,
      trustedOrigins: [process.env.BETTER_AUTH_URL].filter(Boolean) as string[],
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
      },
      // L'adaptateur Kysely utilise les noms de modèles par défaut comme noms
      // de tables (user, session, account, verification) ; les options
      // user/session/account/verification mappent les noms de colonnes.
      user: {
        fields: {
          emailVerified: "email_verified",
          createdAt: "created_at",
          updatedAt: "updated_at",
        },
      },
      session: {
        fields: {
          expiresAt: "expires_at",
          ipAddress: "ip_address",
          userAgent: "user_agent",
          userId: "user_id",
          createdAt: "created_at",
          updatedAt: "updated_at",
        },
      },
      account: {
        fields: {
          accountId: "account_id",
          providerId: "provider_id",
          userId: "user_id",
          accessToken: "access_token",
          refreshToken: "refresh_token",
          idToken: "id_token",
          accessTokenExpiresAt: "access_token_expires_at",
          refreshTokenExpiresAt: "refresh_token_expires_at",
          scope: "scope",
          password: "password",
          createdAt: "created_at",
          updatedAt: "updated_at",
        },
      },
      verification: {
        fields: {
          expiresAt: "expires_at",
          createdAt: "created_at",
          updatedAt: "updated_at",
        },
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
 * initialiser la connexion Postgres pendant le build).
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

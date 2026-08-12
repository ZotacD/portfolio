"use client";

import { createAuthClient } from "better-auth/client";

/**
 * Sans `baseURL`, le client Better Auth utilise l'origine de la page courante.
 * Les requêtes restent donc toujours same-origin (aucun problème de CORS),
 * quel que soit le domaine utilisé en production.
 */
export const authClient = createAuthClient();

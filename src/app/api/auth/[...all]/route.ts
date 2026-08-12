import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Handler Better Auth. L'instance est créée à la demande pour ne pas
 * initialiser la connexion Postgres pendant le build.
 */
const handler = async (request: Request) => {
  const auth = await getAuth();
  return auth.handler(request);
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

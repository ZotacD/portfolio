/**
 * Crée le compte administrateur unique (ADMIN_EMAIL) via Better Auth.
 *
 * Usage :
 *   pnpm db:admin -- .env.local
 *   pnpm db:admin -- .env.production
 *
 * Prérequis :
 * DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL,
 * ADMIN_EMAIL, ADMIN_PASSWORD et base démarrée.
 */

import dotenv from "dotenv";
import { getAuth } from "../src/lib/auth";

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const envFile = args[0];

if (!envFile) {
  throw new Error(
    "Le fichier d'environnement est requis.\n" +
      "Usage : pnpm db:admin -- .env.local"
  );
}

const result = dotenv.config({ path: envFile });

if (result.error) {
  throw new Error(
    `Impossible de charger le fichier d'environnement "${envFile}".`
  );
}

console.log(`→ Environnement chargé depuis : ${envFile}`);

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email) {
    throw new Error(`ADMIN_EMAIL est requis dans ${envFile}.`);
  }

  if (!password || password.length < 8) {
    throw new Error(
      `ADMIN_PASSWORD est requis dans ${envFile} (minimum 8 caractères).`
    );
  }

  const auth = await getAuth();

  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: "Administrateur",
    },
  });

  console.log(`✓ Compte administrateur prêt : ${result.user.email}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`✗ ${message}`);

    if (/exists/i.test(message)) {
      console.error(
        "  → Le compte existe déjà. Si besoin, réinitialisez la base : pnpm db:reset"
      );
    }

    process.exit(1);
  });
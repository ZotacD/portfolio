/**
 * Crée le compte administrateur unique (ADMIN_EMAIL) via Better Auth.
 *
 * Usage : pnpm db:admin
 * Prérequis : .env.local renseigné (DATABASE_URL, BETTER_AUTH_SECRET,
 * BETTER_AUTH_URL, ADMIN_EMAIL, ADMIN_PASSWORD) et base locale démarrée.
 */
import dotenv from "dotenv";
import { getAuth } from "../src/lib/auth";

dotenv.config({ path: ".env.local" });

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email) {
    throw new Error("ADMIN_EMAIL est requis dans .env.local.");
  }
  if (!password || password.length < 8) {
    throw new Error("ADMIN_PASSWORD est requis dans .env.local (minimum 8 caractères).");
  }

  const auth = await getAuth();
  const result = await auth.api.signUpEmail({
    body: { email, password, name: "Administrateur" },
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

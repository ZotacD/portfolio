import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">Erreur 404</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        Page introuvable
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">
          <ArrowLeft />
          Retour à l'accueil
        </Link>
      </Button>
    </main>
  );
}

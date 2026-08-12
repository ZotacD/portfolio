import type { Metadata } from "next";

import { FormProjet } from "@/components/admin/form-projet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Nouveau projet",
  robots: { index: false, follow: false },
};

export default function NouveauProjetPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Nouveau projet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Renseignez les informations du projet puis enregistrez.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <CardDescription>
            Le slug est généré automatiquement depuis le titre.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProjet mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}

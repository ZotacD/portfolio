import type { Metadata } from "next";

import { getAdminProfile } from "@/lib/queries-admin";
import { FormParametres } from "@/components/admin/form-parametres";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Paramètres",
  robots: { index: false, follow: false },
};

export default async function ParametresPage() {
  const profile = await getAdminProfile();

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Informations affichées sur le site public.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Profil du portfolio</CardTitle>
          <CardDescription>
            Nom, titre, bio, coordonnées et réseaux sociaux.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormParametres profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}

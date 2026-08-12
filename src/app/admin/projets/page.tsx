import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { getAdminProjects } from "@/lib/queries-admin";
import { Button } from "@/components/ui/button";
import { ProjetListeAdmin } from "@/components/admin/projet-liste-admin";

export const metadata: Metadata = {
  title: "Projets",
  robots: { index: false, follow: false },
};

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects();

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez vos projets : création, modification, publication.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/projets/nouveau">
            <Plus />
            Nouveau projet
          </Link>
        </Button>
      </header>

      <ProjetListeAdmin projects={projects} />
    </div>
  );
}

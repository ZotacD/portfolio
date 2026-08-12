import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link2, Paperclip } from "lucide-react";

import { getAdminProject, getAdminProjectImages } from "@/lib/queries-admin";
import { getPublicFileUrl } from "@/lib/supabase-server";
import { FormProjet } from "@/components/admin/form-projet";
import { DropzoneFichiers } from "@/components/admin/dropzone-fichiers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Modifier un projet",
  robots: { index: false, follow: false },
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const { project, files } = await getAdminProject(id);
  if (!project) notFound();

  const images = await getAdminProjectImages(id);

  const filesWithUrl = files.map((file) => ({
    ...file,
    url: getPublicFileUrl(file.storage_path),
  }));
  const imagesWithUrl = images.map((image) => ({
    ...image,
    url: getPublicFileUrl(image.storage_path),
  }));

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          Modifier le projet
        </h1>
        {project.status === "published" ? (
          <Badge>Publié</Badge>
        ) : (
          <Badge variant="secondary">Brouillon</Badge>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <CardDescription>
            Modifiez les informations du projet puis enregistrez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProjet mode="edit" project={project} images={imagesWithUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="size-4" />
            Fichiers annexes
          </CardTitle>
          <CardDescription>
            Téléversez des fichiers téléchargeables par les visiteurs (images,
            PDF, archives…).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DropzoneFichiers projectId={project.id} files={filesWithUrl} />
        </CardContent>
      </Card>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link2 className="size-3" />
        Aperçu public : /projets/{project.slug}
      </p>
    </div>
  );
}

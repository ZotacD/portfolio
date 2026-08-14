import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
} from "lucide-react";

import {
  getAdjacentProjects,
  getAllPublishedSlugs,
  getProjectImages,
  getPublishedProject,
} from "@/lib/queries";
import { formatDate, formatBytes } from "@/lib/utils";
import { RichText } from "@/components/public/rich-text";
import { Galerie } from "@/components/public/galerie";
import { Reveal } from "@/components/public/reveal";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProjetPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedProject(slug);
  if (!result) return { title: "Projet introuvable" };

  const { project } = result;
  return {
    title: project.title,
    description: project.excerpt ?? undefined,
    openGraph: {
      title: project.title,
      description: project.excerpt ?? undefined,
      type: "article",
      images: project.coverUrl ? [{ url: project.coverUrl }] : undefined,
    },
  };
}

export default async function ProjetPage({ params }: ProjetPageProps) {
  const { slug } = await params;
  const result = await getPublishedProject(slug);
  if (!result) notFound();

  const { project, files } = result;
  const [images, { prev, next }] = await Promise.all([
    getProjectImages(project.id),
    getAdjacentProjects(slug),
  ]);

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Accueil</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/projets">Projets</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {project.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {project.publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" />
              {formatDate(project.publishedAt)}
            </span>
          )}
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        {project.linkUrl && (
          <div className="mt-6">
            <Button asChild>
              <a
                href={project.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink />
                Voir le projet
              </a>
            </Button>
          </div>
        )}
      </header>

      {project.coverUrl ? (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl bg-muted">
          <Image
            src={project.coverUrl}
            alt={`Couverture du projet ${project.title}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      ) : (
        <div className="mt-8 flex aspect-video w-full items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <ImageIcon className="size-10" />
        </div>
      )}

      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert">
        {project.excerpt && (
          <p className="text-lg leading-relaxed">{project.excerpt}</p>
        )}
      </div>

      <Reveal>
        {project.description ? (
          <div className="mt-8">
            <RichText content={project.description} />
          </div>
        ) : (
          <p className="mt-8 text-muted-foreground">
            Aucune description pour ce projet.
          </p>
        )}
      </Reveal>

      {images.length > 0 && (
        <Reveal className="mt-12">
          <section>
            <h2 className="text-xl font-semibold tracking-tight">Galerie</h2>
            <div className="mt-4">
              <Galerie images={images} alt={project.title} />
            </div>
          </section>
        </Reveal>
      )}

      {files.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            Fichiers annexes
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {files.map((file) => (
              <Card key={file.id}>
                <CardHeader className="p-4 pb-1">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{file.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between p-4 pt-2 text-sm text-muted-foreground">
                  <span>{file.size ? formatBytes(file.size) : null}</span>
                  {file.url && (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={file.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download />
                        Télécharger
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {(prev || next) && (
        <nav className="mt-16 grid gap-4 border-t pt-8 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/projets/${prev.slug}`}
              className="group flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ArrowLeft className="size-3.5" />
                Projet précédent
              </span>
              <span className="font-medium group-hover:underline">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/projets/${next.slug}`}
              className="group flex flex-col gap-1 rounded-lg border p-4 text-right transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                Projet suivant
                <ArrowRight className="size-3.5" />
              </span>
              <span className="font-medium group-hover:underline">
                {next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}

      <div className="mt-10 flex justify-center">
        <Button asChild variant="ghost">
          <Link href="/projets">
            <ArrowLeft />
            Retour aux projets
          </Link>
        </Button>
      </div>
    </article>
  );
}

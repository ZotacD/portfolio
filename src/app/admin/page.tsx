import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  Circle,
  Eye,
  EyeOff,
  FileText,
  FolderGit2,
  Plus,
  Settings,
} from "lucide-react";

import {
  getAdminProfile,
  getAdminStats,
  getCoverCount,
  getTagsBreakdown,
} from "@/lib/queries-admin";
import { ChartRepartition } from "@/components/admin/chart-repartition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = {
  title: "Tableau de bord",
  robots: { index: false, follow: false },
};

export default async function AdminHomePage() {
  const [stats, tags, coverCount, profile] = await Promise.all([
    getAdminStats(),
    getTagsBreakdown(8),
    getCoverCount(),
    getAdminProfile(),
  ]);

  const cards = [
    {
      label: "Projets",
      value: stats.total,
      description: "au total",
      icon: FolderGit2,
    },
    {
      label: "Publiés",
      value: stats.published,
      description: "visibles sur le site",
      icon: Eye,
    },
    {
      label: "Brouillons",
      value: stats.drafts,
      description: "en attente de publication",
      icon: EyeOff,
    },
    {
      label: "Fichiers",
      value: stats.files,
      description: "téléversés",
      icon: FileText,
    },
  ];

  const checklist = [
    {
      label: "Nom et titre renseignés",
      done: Boolean(profile?.name && profile?.title),
      href: "/admin/parametres",
    },
    {
      label: "Email de contact défini",
      done: Boolean(profile?.email),
      href: "/admin/parametres",
    },
    {
      label: "Réseaux sociaux ajoutés",
      done: Object.keys(profile?.social ?? {}).length > 0,
      href: "/admin/parametres",
    },
    {
      label: "Au moins un projet publié",
      done: stats.published > 0,
      href: "/admin/projets",
    },
    {
      label: "Images de couverture",
      done: coverCount > 0,
      href: "/admin/projets",
    },
    {
      label: "Fichiers téléversés",
      done: stats.files > 0,
      href: "/admin/projets",
    },
    {
      label: "URL du site configurée",
      done: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
      href: "/admin/parametres",
    },
  ];
  const doneCount = checklist.filter((item) => item.done).length;
  const progressValue = Math.round((doneCount / checklist.length) * 100);

  const maxTagCount = Math.max(1, ...tags.map((t) => t.count));

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vue d'ensemble de votre portfolio.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/projets/nouveau">
            <Plus />
            Nouveau projet
          </Link>
        </Button>
      </header>

      <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.label}
                </CardTitle>
                <div className="rounded-lg bg-muted p-1.5">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">{card.value}</p>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des statuts</CardTitle>
            <CardDescription>
              Projets publiés par rapport aux brouillons.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.total > 0 ? (
              <ChartRepartition
                data={[
                  { name: "published", value: stats.published },
                  { name: "draft", value: stats.drafts },
                ]}
              />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Aucun projet pour le moment.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist du site</CardTitle>
            <CardDescription>
              {doneCount} sur {checklist.length} points complétés.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Progress value={progressValue} aria-label="Progression du site" />
            <ul className="grid gap-1">
              {checklist.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    {item.done ? (
                      <Check className="size-4 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted-foreground/50" />
                    )}
                    <span
                      className={
                        item.done
                          ? "text-muted-foreground line-through decoration-muted-foreground/40"
                          : ""
                      }
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tags les plus utilisés</CardTitle>
            <CardDescription>
              Vos technologies et catégories récurrentes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tags.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucun tag pour le moment.
              </p>
            ) : (
              <ul className="grid gap-3">
                {tags.map((item) => (
                  <li key={item.tag} className="grid gap-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium">{item.tag}</span>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-[width]"
                        style={{
                          width: `${Math.round((item.count / maxTagCount) * 100)}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accès directs aux tâches courantes.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/projets">
                <FolderGit2 />
                Gérer les projets
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/projets/nouveau">
                <Plus />
                Créer un projet
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/parametres">
                <Settings />
                Modifier les paramètres
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/projets">
                <Eye />
                Voir le site public
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

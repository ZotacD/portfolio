"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PublishSwitch } from "@/components/admin/publish-switch";
import { deleteProject } from "@/actions/projects";
import { formatDate } from "@/lib/utils";
import type { ProjectRow } from "@/types";

function DeleteProjectMenuItem({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(() => {
      toast.info("Suppression en cours…");
      deleteProject(projectId);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <DropdownMenuItem
        variant="destructive"
        onSelect={() => setOpen(true)}
      >
        <Trash2 />
        Supprimer
      </DropdownMenuItem>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Le projet et tous ses fichiers
            annexes seront supprimés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={handleDelete}
          >
            {pending ? "Suppression…" : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ProjetListeAdmin({ projects }: { projects: ProjectRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStatus = status === "all" || project.status === status;
      const matchesQuery =
        normalized === "" ||
        project.title.toLowerCase().includes(normalized) ||
        project.slug.toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [projects, query, status]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Rechercher un projet…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="max-w-xs"
          aria-label="Rechercher un projet"
        />
        <Select
          value={status}
          onValueChange={(value) =>
            setStatus(value as "all" | "draft" | "published")
          }
        >
          <SelectTrigger className="w-40" aria-label="Filtrer par statut">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="published">Publiés</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground sm:ml-auto">
          {filtered.length} projet{filtered.length > 1 ? "s" : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {projects.length === 0
              ? "Aucun projet pour le moment. Créez votre premier projet."
              : "Aucun projet ne correspond à vos critères."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projet</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Publié</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/projets/${project.id}`}
                      className="hover:underline"
                    >
                      {project.title}
                    </Link>
                    <span className="block text-xs text-muted-foreground">
                      /projets/{project.slug}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <PublishSwitch
                        projectId={project.id}
                        checked={project.status === "published"}
                      />
                      {project.status === "published" ? (
                        <Badge>Publié</Badge>
                      ) : (
                        <Badge variant="secondary">Brouillon</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {project.publishedAt
                      ? formatDate(project.publishedAt)
                      : "—"}
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">{project.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Actions">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/projets/${project.id}`}>
                            <Pencil />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/projets/${project.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink />
                            Voir la page
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DeleteProjectMenuItem projectId={project.id} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

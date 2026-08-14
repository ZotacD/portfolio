"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { projectSchema, type ProjectInput } from "@/lib/schema";
import { slugify, formatDate } from "@/lib/utils";
import { createProject, updateProject } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ImagePicker } from "@/components/admin/image-picker";
import type { ProjectImageWithUrl, ProjectRow } from "@/types";

interface FormProjetProps {
  mode: "create" | "edit";
  project?: ProjectRow | null;
  images?: ProjectImageWithUrl[];
}

export function FormProjet({ mode, project, images = [] }: FormProjetProps) {
  const router = useRouter();
  const [publishedDate, setPublishedDate] = useState<Date | undefined>(
    project?.publishedAt ?? undefined
  );
  const slugEdited = useRef(mode === "edit");

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title ?? "",
      slug: project?.slug ?? "",
      excerpt: project?.excerpt ?? "",
      description: project?.description ?? "",
      coverUrl: project?.coverUrl ?? "",
      linkUrl: project?.linkUrl ?? "",
      tags: project?.tags ?? [],
      status: project?.status ?? "draft",
      sortOrder: project?.sortOrder ?? 0,
      publishedAt: null,
    },
  });

  async function onSubmit(values: ProjectInput) {
    const payload: ProjectInput = {
      ...values,
      publishedAt: publishedDate ? publishedDate.toISOString() : null,
    };

    const result =
      mode === "create"
        ? await createProject(payload)
        : await updateProject(project!.id, payload);

    if (result.status === "success") {
      toast.success(result.message ?? "Enregistrement réussi.");
      if (mode === "create") {
        router.push("/admin/projets");
      } else {
        router.refresh();
      }
      return;
    }

    if (result.fieldErrors) {
      for (const [key, messages] of Object.entries(result.fieldErrors)) {
        if (messages && messages.length > 0) {
          form.setError(key as keyof ProjectInput, { message: messages[0] });
        }
      }
    }
    toast.error(result.message ?? "Une erreur est survenue.");
  }

  const isPublished = form.watch("status") === "published";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Titre du projet"
                    {...field}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                      if (!slugEdited.current) {
                        form.setValue("slug", slugify(event.target.value));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="mon-projet"
                    {...field}
                    onChange={(event) => {
                      slugEdited.current = true;
                      field.onChange(event.target.value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  URL : /projets/{form.watch("slug") || "mon-projet"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Extrait</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Résumé du projet (affiché sur les cartes)"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Markdown)</FormLabel>
              <FormControl>
                <Textarea
                  rows={12}
                  placeholder={"# Titre\n\nVotre description en **Markdown**…"}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Markdown supporté : titres, listes, liens, images, code…
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid items-start gap-6 lg:grid-cols-2">
        <FormField
          control={form.control}
          name="linkUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lien du projet</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://exemple.com/demo"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Lien externe vers une démo, un dépôt GitHub, un article…
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input
                    placeholder="design, react, supabase"
                    value={field.value.join(", ")}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value
                          .split(/[;,]/)
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                      )
                    }
                  />
                </FormControl>
                <FormDescription>Séparés par des virgules.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordre d'affichage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value as "draft" | "published")
                  }
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-2">
            <Label>Date de publication</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start gap-2 text-left font-normal"
                >
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  {publishedDate
                    ? formatDate(publishedDate)
                    : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={publishedDate}
                  onSelect={setPublishedDate}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {isPublished
                  ? "Renseignée automatiquement à la publication si vide."
                  : "Renseignée lors de la publication."}
              </p>
              {publishedDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground"
                  onClick={() => setPublishedDate(undefined)}
                >
                  <X />
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="coverUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image de couverture</FormLabel>
              <FormControl>
                <ImagePicker
                  purpose="covers"
                  value={field.value ?? null}
                  onChange={(url) => field.onChange(url)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-2">
          <Label>Galerie de photos</Label>
          {mode === "edit" && project ? (
            <>
              <p className="text-xs text-muted-foreground">
                Plusieurs photos affichées dans une galerie sur la page du
                projet. Elles sont ajoutées immédiatement.
              </p>
              <ImagePicker
                purpose="gallery"
                projectId={project.id}
                images={images}
              />
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Les photos s'ajoutent après la création du projet, depuis la page
              d'édition.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 border-t pt-6">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
            {form.formState.isSubmitting
              ? "Enregistrement…"
              : mode === "create"
                ? "Créer le projet"
                : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

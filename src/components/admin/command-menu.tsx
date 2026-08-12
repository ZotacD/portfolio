"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderGit2,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import type { ProjectSearchItem } from "@/lib/queries-admin";

export function CommandMenu({
  projects,
}: {
  projects: ProjectSearchItem[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="hidden lg:inline">Rechercher…</span>
        <kbd className="pointer-events-none hidden rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher un projet ou une action…" />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => go("/admin")}>
              <LayoutDashboard />
              Tableau de bord
            </CommandItem>
            <CommandItem onSelect={() => go("/admin/projets")}>
              <FolderGit2 />
              Projets
            </CommandItem>
            <CommandItem onSelect={() => go("/admin/projets/nouveau")}>
              <Plus />
              Nouveau projet
            </CommandItem>
            <CommandItem onSelect={() => go("/admin/parametres")}>
              <Settings />
              Paramètres
            </CommandItem>
          </CommandGroup>
          {projects.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Projets">
                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`${project.title} ${project.slug}`}
                    onSelect={() => go(`/admin/projets/${project.id}`)}
                  >
                    <FolderGit2 />
                    {project.title}
                    <CommandShortcut>
                      {project.status === "published" ? "Publié" : "Brouillon"}
                    </CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

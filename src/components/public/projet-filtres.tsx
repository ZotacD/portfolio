"use client";

import { useMemo, useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardProjet } from "@/components/public/card-projet";
import type { ProjectRow } from "@/types";

export function ProjetFiltres({
  projects,
  tags,
}: {
  projects: ProjectRow[];
  tags: string[];
}) {
  const [selected, setSelected] = useState<string>("all");

  const filtered = useMemo(
    () =>
      selected === "all"
        ? projects
        : projects.filter((project) => project.tags.includes(selected)),
    [projects, selected]
  );

  return (
    <div>
      <Tabs value={selected} onValueChange={setSelected}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="all">Tous</TabsTrigger>
          {tags.map((tag) => (
            <TabsTrigger key={tag} value={tag}>
              {tag}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <CardProjet key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-muted-foreground">
          Aucun projet ne correspond à ce tag.
        </p>
      )}
    </div>
  );
}

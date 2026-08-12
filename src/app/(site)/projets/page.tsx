import type { Metadata } from "next";

import { getDistinctTags, getPublishedProjects } from "@/lib/queries";
import { ProjetFiltres } from "@/components/public/projet-filtres";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "Projets",
  description: "Tous mes projets, filtrables par technologie ou catégorie.",
};

export default async function ProjetsPage() {
  const [projects, tags] = await Promise.all([
    getPublishedProjects(),
    getDistinctTags(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Reveal>
        <header className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Projets</h1>
          <p className="mt-3 text-muted-foreground">
            Une sélection de mes réalisations. Filtrez par tag pour explorer les
            projets qui vous intéressent.
          </p>
        </header>
      </Reveal>

      <Reveal delay={100} className="mt-8">
        <ProjetFiltres projects={projects} tags={tags} />
      </Reveal>
    </div>
  );
}

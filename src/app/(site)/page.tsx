import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

import { getLatestProjects, getProfile } from "@/lib/queries";
import { Hero } from "@/components/public/hero";
import { CardProjet } from "@/components/public/card-projet";
import { Reveal } from "@/components/public/reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Portfolio personnel : découvrez mes derniers projets, mon parcours et mes coordonnées.",
};

export default async function HomePage() {
  const [profile, projects] = await Promise.all([
    getProfile(),
    getLatestProjects(3),
  ]);

  return (
    <>
      <Hero profile={profile} />

      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Derniers projets
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Une sélection de mes réalisations récentes.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/projets">
                  Tous les projets
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={100}>
            {projects.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <CardProjet key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <p className="mt-8 text-muted-foreground">
                Aucun projet publié pour le moment.
              </p>
            )}
          </Reveal>
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <Reveal>
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Une question ? Un projet ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            N'hésitez pas à me contacter pour discuter de votre idée ou de
            votre projet.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {profile?.email && (
              <Button asChild variant="outline">
                <a href={`mailto:${profile.email}`}>
                  <Mail />
                  {profile.email}
                </a>
              </Button>
            )}
            <Button asChild>
              <Link href="/contact">
                Aller au formulaire de contact
                <ArrowRight />
              </Link>
            </Button>
          </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

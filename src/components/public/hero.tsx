import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/public/reveal";
import type { ProfileRow } from "@/types";

export function Hero({ profile }: { profile: ProfileRow | null }) {
  const name = profile?.name || "Portfolio";
  const title = profile?.title || "Développeur web";
  const bio =
    profile?.bio ||
    "Bienvenue sur mon portfolio. Découvrez mes projets et mes réalisations.";

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-linear-to-b from-primary/10 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 gap-1.5 px-3 py-1">
              <Sparkles className="size-3.5" />
              Disponible pour de nouveaux projets
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              {name}
            </h1>
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              {title}
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {bio}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/projets">
                  Voir mes projets
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Me contacter</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

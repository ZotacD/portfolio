import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectRow } from "@/types";

export function CardProjet({ project }: { project: ProjectRow }) {
  return (
    <Link href={`/projets/${project.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {project.coverUrl ? (
            <Image
              src={project.coverUrl}
              alt={`Couverture du projet ${project.title}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-8" />
            </div>
          )}
        </div>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-medium group-hover:underline">
            {project.title}
          </CardTitle>
        </CardHeader>
        {project.excerpt ? (
          <CardContent className="p-4 pt-0">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {project.excerpt}
            </p>
          </CardContent>
        ) : null}
        <CardFooter className="mt-auto flex flex-wrap gap-1 p-4 pt-2">
          {project.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </CardFooter>
      </Card>
    </Link>
  );
}

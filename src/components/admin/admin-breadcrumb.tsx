"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const CRUMB_TITLES: Record<string, string> = {
  "/admin": "Tableau de bord",
  "/admin/projets": "Projets",
  "/admin/projets/nouveau": "Nouveau projet",
  "/admin/parametres": "Paramètres",
};

export function AdminBreadcrumb() {
  const pathname = usePathname();

  if (pathname === "/admin") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Tableau de bord</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const segments = pathname.split("/").filter(Boolean); // ["admin", "projets", "id"]
  const isEdit =
    segments[1] === "projets" && segments.length === 3 && segments[2] !== "nouveau";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/admin">Administration</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        {isEdit ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/projets">Projets</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Modifier</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage>
              {CRUMB_TITLES[pathname] ?? "Administration"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

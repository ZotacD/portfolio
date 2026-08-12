import Link from "next/link";

import { getProfile } from "@/lib/queries";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteNav } from "@/components/public/site-nav";

export interface NavLink {
  href: string;
  label: string;
}

export async function Header() {
  const profile = await getProfile();
  const name = profile?.name || "Portfolio";

  const links: NavLink[] = [
    { href: "/", label: "Accueil" },
    { href: "/projets", label: "Projets" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          {name}
        </Link>

        <div className="flex items-center gap-1">
          <SiteNav links={links} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { Briefcase, Code, Hash, Mail } from "lucide-react";

import { getProfile } from "@/lib/queries";

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Code,
  linkedin: Briefcase,
  twitter: Hash,
};

export async function Footer() {
  const profile = await getProfile();
  const name = profile?.name || "Portfolio";
  const year = new Date().getFullYear();

  const socialEntries = Object.entries(profile?.social ?? {}).filter(
    ([, url]) => url
  );

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-muted-foreground">
          © {year} {name}. Tous droits réservés.
        </p>

        <div className="flex items-center gap-4">
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="size-4" />
            </a>
          )}
          {socialEntries.map(([key, url]) => {
            const Icon = SOCIAL_ICONS[key] ?? Code;
            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Lien ${key}`}
              >
                <Icon className="size-4" />
              </a>
            );
          })}
          <Link
            href="/contact"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

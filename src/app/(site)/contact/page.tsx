import type { Metadata } from "next";
import { Briefcase, Code, Hash, Mail, MapPin, Phone } from "lucide-react";

import { getProfile } from "@/lib/queries";
import { ContactForm } from "@/components/public/contact-form";
import { Reveal } from "@/components/public/reveal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez-moi pour un projet, une question ou une collaboration.",
};

const SOCIAL_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  github: { label: "GitHub", icon: Code },
  linkedin: { label: "LinkedIn", icon: Briefcase },
  twitter: { label: "X (Twitter)", icon: Hash },
};

export default async function ContactPage() {
  const profile = await getProfile();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact</h1>
        <p className="mt-3 text-muted-foreground">
          Une question, une opportunité de collaboration ou simplement envie
          d'échanger ? Écrivez-moi.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mes coordonnées</CardTitle>
              <CardDescription>
                Je réponds généralement sous 24 à 48 heures.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="size-4 shrink-0" />
                  {profile.email}
                </a>
              )}
              {profile?.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="size-4 shrink-0" />
                  {profile.phone}
                </a>
              )}
              {profile?.location && (
                <p className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  {profile.location}
                </p>
              )}

              {Object.entries(profile?.social ?? {}).some(([, value]) => value) && (
                <>
                  <Separator />
                  {Object.entries(profile?.social ?? {}).map(([key, url]) => {
                    if (!url) return null;
                    const meta = SOCIAL_META[key];
                    if (!meta) return null;
                    const Icon = meta.icon;
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Icon className="size-4 shrink-0" />
                        {meta.label}
                      </a>
                    );
                  })}
                </>
              )}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Formulaire de contact</CardTitle>
              <CardDescription>
                Tous les champs marqués d'un astérisque sont obligatoires.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}

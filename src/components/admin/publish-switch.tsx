"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { toggleProjectStatus } from "@/actions/projects";

export function PublishSwitch({
  projectId,
  checked,
}: {
  projectId: string;
  checked: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(value: boolean) {
    const status = value ? "published" : "draft";
    startTransition(async () => {
      const result = await toggleProjectStatus(projectId, status);
      if (result.status === "success") {
        toast.success(result.message ?? "Statut mis à jour.");
        router.refresh();
      } else {
        toast.error(result.message ?? "Erreur lors de la mise à jour.");
      }
    });
  }

  return (
    <Switch
      checked={checked}
      disabled={pending}
      onCheckedChange={handleChange}
      aria-label={checked ? "Passer en brouillon" : "Publier"}
    />
  );
}

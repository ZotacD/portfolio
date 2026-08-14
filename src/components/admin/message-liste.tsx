"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  MailOpen,
  Reply,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  deleteContactMessage,
  markAllMessagesRead,
  toggleMessageRead,
} from "@/actions/contact";
import { cn, formatDate } from "@/lib/utils";
import type { ContactMessageRow } from "@/types";

export function MessageListe({
  messages,
  unreadCount,
}: {
  messages: ContactMessageRow[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<ContactMessageRow | null>(null);
  const [pending, startTransition] = useTransition();

  function handleToggleRead(message: ContactMessageRow) {
    startTransition(async () => {
      const result = await toggleMessageRead(message.id, !message.read);
      if (result.status === "success") {
        setSelected({ ...message, read: !message.read });
        toast.success(result.message ?? "Statut mis à jour.");
        router.refresh();
      } else {
        toast.error(result.message ?? "Erreur lors de la mise à jour.");
      }
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      const result = await markAllMessagesRead();
      if (result.status === "success") {
        toast.success(result.message ?? "Tous les messages sont marqués comme lus.");
        router.refresh();
      } else {
        toast.error(result.message ?? "Erreur lors de la mise à jour.");
      }
    });
  }

  function handleDelete(message: ContactMessageRow) {
    startTransition(async () => {
      const result = await deleteContactMessage(message.id);
      if (result.status === "success") {
        setSelected(null);
        toast.success(result.message ?? "Message supprimé.");
        router.refresh();
      } else {
        toast.error(result.message ?? "Erreur lors de la suppression.");
      }
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0
            ? `${unreadCount} message${unreadCount > 1 ? "s" : ""} non lu${unreadCount > 1 ? "s" : ""}`
            : "Aucun message non lu."}
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={unreadCount === 0 || pending}
          onClick={handleMarkAllRead}
        >
          <MailOpen />
          Tout marquer lu
        </Button>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Aucun message pour le moment. Les messages envoyés depuis la page
            contact apparaîtront ici.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {messages.map((message) => (
            <li key={message.id}>
              <button
                type="button"
                onClick={() => setSelected(message)}
                className={cn(
                  "flex w-full flex-col gap-1.5 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  !message.read && "border-primary/40 bg-muted/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {!message.read && (
                      <span className="size-2 shrink-0 rounded-full bg-primary" />
                    )}
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        message.read && "text-muted-foreground"
                      )}
                    >
                      {message.subject || "Sans objet"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(message.createdAt)}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {message.name} · {message.email}
                </p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {message.message}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.subject || "Sans objet"}</DialogTitle>
            <DialogDescription>
              {selected?.name} · {selected?.email} ·{" "}
              {selected && formatDate(selected.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm">
            {selected?.message}
          </div>

          <DialogFooter className="flex-wrap gap-2">
            {selected && (
              <>
                <Button asChild variant="outline" size="sm">
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(
                      `Re: ${selected.subject ?? ""}`
                    )}`}
                  >
                    <Reply />
                    Répondre
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => handleToggleRead(selected)}
                >
                  {selected.read ? <Mail /> : <MailOpen />}
                  {selected.read ? "Marquer non lu" : "Marquer lu"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={pending}
                    >
                      <Trash2 />
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Supprimer ce message ?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={pending}>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        disabled={pending}
                        onClick={() => handleDelete(selected)}
                      >
                        {pending ? "Suppression…" : "Supprimer"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

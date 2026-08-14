import type { Metadata } from "next";

import {
  getContactMessages,
  getUnreadContactMessagesCount,
} from "@/lib/queries-admin";
import { MessageListe } from "@/components/admin/message-liste";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export default async function AdminMessagesPage() {
  const [messages, unreadCount] = await Promise.all([
    getContactMessages(),
    getUnreadContactMessagesCount(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages envoyés depuis la page contact.
        </p>
      </header>

      <MessageListe messages={messages} unreadCount={unreadCount} />
    </div>
  );
}

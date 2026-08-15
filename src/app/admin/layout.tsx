import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import {
  getProjectSearchData,
  getAdminStats,
  getUnreadContactMessagesCount,
} from "@/lib/queries-admin";
import { SidebarAdmin } from "@/components/admin/sidebar";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { CommandMenu } from "@/components/admin/command-menu";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();
  if (!session) redirect("/login");

  const [stats, projects, unreadCount] = await Promise.all([
    getAdminStats(),
    getProjectSearchData(),
    getUnreadContactMessagesCount(),
  ]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <SidebarAdmin
          user={session.user}
          draftCount={stats.drafts}
          unreadCount={unreadCount}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 self-center"
              />
              <AdminBreadcrumb />
            </div>
            <div className="ml-auto flex items-center gap-2 px-4">
              <CommandMenu projects={projects} />
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MobileShell } from "@/components/mobile/MobileShell";
import { MobileNotifications } from "@/components/mobile/MobileNotifications";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () => ({ meta: [{ title: "Notifications — ResumePilot" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <>
      <div className="hidden lg:block">
        <AppShell title="Notifications" subtitle="Manage your notification preferences.">
          <div className="p-6 text-center text-muted-foreground">
            Notification settings are only available on mobile devices.
          </div>
        </AppShell>
      </div>

      <div className="block lg:hidden">
        <MobileShell>
          <MobileNotifications />
        </MobileShell>
      </div>
    </>
  );
}

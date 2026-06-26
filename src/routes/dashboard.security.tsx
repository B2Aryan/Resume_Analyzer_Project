import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MobileShell } from "@/components/mobile/MobileShell";
import { MobileSecurity } from "@/components/mobile/MobileSecurity";

export const Route = createFileRoute("/dashboard/security")({
  head: () => ({ meta: [{ title: "Security — ResumePilot" }] }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <>
      <div className="hidden lg:block">
        <AppShell title="Security" subtitle="Manage your security settings.">
          <div className="p-6 text-center text-muted-foreground">
            Security settings are only available on mobile devices.
          </div>
        </AppShell>
      </div>

      <div className="block lg:hidden">
        <MobileShell>
          <MobileSecurity />
        </MobileShell>
      </div>
    </>
  );
}

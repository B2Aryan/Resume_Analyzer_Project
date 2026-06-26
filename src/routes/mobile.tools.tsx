import { createFileRoute } from "@tanstack/react-router";
import { MobileTools } from "@/components/mobile/MobileTools";
import { MobileShell } from "@/components/mobile/MobileShell";

export const Route = createFileRoute("/mobile/tools")({
  head: () => ({
    meta: [{ title: "Tools — ResumePilot" }],
  }),
  component: MobileToolsPage,
});

function MobileToolsPage() {
  return (
    <MobileShell>
      <MobileTools />
    </MobileShell>
  );
}

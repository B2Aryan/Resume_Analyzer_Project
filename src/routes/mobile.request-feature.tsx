import { createFileRoute } from "@tanstack/react-router";
import { MobileRequestFeature } from "@/components/mobile/MobileRequestFeature";
import { MobileShell } from "@/components/mobile/MobileShell";

export const Route = createFileRoute("/mobile/request-feature")({
  head: () => ({
    meta: [{ title: "Request a Feature — ResumePilot" }],
  }),
  component: MobileRequestFeaturePage,
});

function MobileRequestFeaturePage() {
  return (
    <MobileShell>
      <MobileRequestFeature />
    </MobileShell>
  );
}

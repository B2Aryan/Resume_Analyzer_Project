import { createFileRoute } from "@tanstack/react-router";
import { MobileInsights } from "@/components/mobile/MobileInsights";
import { MobileShell } from "@/components/mobile/MobileShell";

export const Route = createFileRoute("/mobile/insights")({
  head: () => ({
    meta: [{ title: "Insights — ResumePilot" }],
  }),
  component: MobileInsightsPage,
});

function MobileInsightsPage() {
  return (
    <MobileShell>
      <MobileInsights />
    </MobileShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { MobileBetaProgram } from "@/components/mobile/MobileBetaProgram";
import { MobileShell } from "@/components/mobile/MobileShell";

export const Route = createFileRoute("/mobile/beta-program")({
  head: () => ({
    meta: [{ title: "Beta Program — ResumePilot" }],
  }),
  component: MobileBetaProgramPage,
});

function MobileBetaProgramPage() {
  return (
    <MobileShell>
      <MobileBetaProgram />
    </MobileShell>
  );
}

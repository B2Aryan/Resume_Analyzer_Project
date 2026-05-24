import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/saved")({
  head: () => ({ meta: [{ title: "Saved Reports — ResumeCheck AI" }] }),
  component: () => (
    <AppShell title="Saved reports" subtitle="Pinned analyses you want to revisit.">
      <Card className="border-dashed border-border/60">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
            <Bookmark className="h-6 w-6" />
          </div>
          <p className="mt-4 font-display text-lg font-semibold">No saved reports yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Bookmark important analyses from the result page to access them quickly here.</p>
          <Button asChild className="mt-6" variant="hero"><Link to="/upload">Run a new scan</Link></Button>
        </CardContent>
      </Card>
    </AppShell>
  ),
});
